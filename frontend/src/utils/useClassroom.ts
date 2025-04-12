import { useCallback, useMemo, useState } from "react";
import * as xlsx from "xlsx";
import { z } from "zod";

const CLASSROOMS_KEY = "kdb_classrooms";
const CLASSROOMS_VERSION = 1;

const classroomsSchema = z.object({
  version: z.literal(CLASSROOMS_VERSION),
  updatedAt: z.string(),
  subjects: z.record(z.string(), z.string()),
});

type Classrooms = z.infer<typeof classroomsSchema>;

const createEmptyClassrooms = (): Classrooms => {
  return {
    version: CLASSROOMS_VERSION,
    updatedAt: new Date().toISOString(),
    subjects: {},
  };
};

const getLocalClassrooms = (): Classrooms | null => {
  const value = localStorage.getItem(CLASSROOMS_KEY);
  if (!value) {
    return null;
  }
  const result = classroomsSchema.safeParse(JSON.parse(value));
  return result.success ? result.data : null;
};

const localStorageBookmarks = getLocalClassrooms();

const saveClassrooms = (classrooms: Classrooms) => {
  localStorage.setItem(CLASSROOMS_KEY, JSON.stringify(classrooms));
};

export const useClassroom = () => {
  const [classroom, setClassroom] = useState<Classrooms | null>(
    localStorageBookmarks,
  );

  const classroomsUpdatedAt = useMemo(() => {
    return classroom?.updatedAt ?? null;
  }, [classroom?.updatedAt]);

  const getClassroom = useCallback(
    (subjectCode: string) => {
      return classroom?.subjects[subjectCode] ?? null;
    },
    [classroom?.subjects],
  );

  const importFile = async (file: File) => {
    try {
      // ファイルを読込
      const buffer = await new Promise<ArrayBuffer | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as ArrayBuffer);
        };
        reader.readAsArrayBuffer(file);
      });

      // Excel をパース
      const workbook = xlsx.read(buffer);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      if (!firstSheetName) {
        throw new Error("Excel ファイルにシートが存在しません");
      }
      const data = xlsx.utils.sheet_to_json(worksheet);

      const newClassrooms = createEmptyClassrooms();

      for (const row of data) {
        const rowRecord = row as Record<string, string>;
        const subjectCode = rowRecord.科目番号;
        const classroom = rowRecord.教室;
        if (subjectCode && classroom) {
          newClassrooms.subjects[subjectCode] = classroom;
        }
      }

      if (Object.keys(newClassrooms.subjects).length === 0) {
        throw new Error("科目データが存在しません");
      }

      setClassroom(newClassrooms);
      saveClassrooms(newClassrooms);
      return { type: "success" };
    } catch (e) {
      return { type: "error", error: e as Error };
    }
  };

  const clearClassrooms = () => {
    setClassroom(null);
    localStorage.removeItem(CLASSROOMS_KEY);
  };

  return {
    classroomsUpdatedAt,
    getClassroom,
    importFile,
    clearClassrooms,
  };
};
