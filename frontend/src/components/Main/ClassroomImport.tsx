import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import Modal from "react-modal";

import { colorPurpleDark, shadow } from "@/utils/style";
import type { useClassroom } from "@/utils/useClassroom";

const H2 = styled.h2`
  color: ${colorPurpleDark};
  font-size: 20px;
  margin: 0 0 8px 0;
`;

const Ul = styled.ul`
  margin: 0;
  padding: 0 0 0 16px;

  li + li {
    margin-top: 4px;
  }
`;

const Dropbox = styled.div`
  width: 100%;
  height: 100px;
  margin-top: 12px;
  border-top: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Anchor = styled.a`
  color: #666;
  text-decoration: underline;
  text-decoration-color: #ccc;
  text-underline-offset: 4px;

  &:hover {
    opacity: 0.8;
  }
`;

const customStyles: Modal.Styles = {
  content: {
    width: "500px",
    height: "fit-content",
    fontSize: "15px",
    margin: "auto",
    border: "none",
    borderRadius: "16px",
    boxSizing: "border-box",
    boxShadow: shadow,
    padding: "24px 32px",
    background: "#fff",
  },
};

interface ClassroomImportProps {
  isImporting: boolean;
  usedClassroom: ReturnType<typeof useClassroom>;
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
}

const ClassroomImport = ({
  isImporting,
  usedClassroom,
  setIsImporting,
}: ClassroomImportProps) => {
  const { classroomsUpdatedAt, importFile, clearClassrooms } = usedClassroom;

  const formattedUpdatedAt = useMemo(() => {
    if (!classroomsUpdatedAt) {
      return null;
    }
    const date = new Date(classroomsUpdatedAt);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [classroomsUpdatedAt]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      (async () => {
        const result = await importFile(acceptedFiles[0]);
        if (result.error) {
          alert(`インポートに失敗しました：${result.error.message}`);
          return;
        }
        alert("科目情報をインポートしました");
      })();
    },
    [importFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Modal
      isOpen={isImporting}
      onRequestClose={() => setIsImporting(false)}
      style={customStyles}
    >
      <H2>科目情報をインポート</H2>
      <Ul>
        <li>インポートした情報はローカルにのみ保存されます。</li>
        <li>
          学外者やインターネット上に情報を共有する場合は、
          <br />
          学外に非公開の情報（教室情報等）が写り込まないよう
          <br />
          十分に注意してください。
        </li>
      </Ul>
      <p>
        {formattedUpdatedAt ? (
          <>
            最終更新：{formattedUpdatedAt}（
            <Anchor onClick={clearClassrooms}>削除</Anchor>）
          </>
        ) : (
          "現在までにインポートされた科目情報はありません"
        )}
      </p>
      <Dropbox {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>ファイルをドラッグ</p>
        ) : (
          <p>ドラッグまたはクリックしてファイルを選択</p>
        )}
      </Dropbox>
    </Modal>
  );
};

export default ClassroomImport;
