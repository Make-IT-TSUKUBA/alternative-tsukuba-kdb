import type { Subject } from '.';
import { onBookmarkChanged } from '../bookmark';

/**
 * Subjectオブジェクトからtr要素を作るメソッド。旧Subject.createTrメソッド。
 * @param {Subject} subject もとになるSubjectのインスタンス。
 * @returns {HTMLTableRowElement} 表示するべきtr要素
 */
export function renderSubjectAsTableRow(subject: Subject): HTMLTableRowElement {
  const tr = document.createElement('tr');
  tr.setAttribute("itemscope", "")
  tr.setAttribute("itemtype", "https://schema.org/Course")

  const lineBreak = () => document.createElement('br');

  const anchorOfficial = createAnchorOfficial(subject);
  const anchorMirror = createAnchorMirror(subject.code, subject.name);

  const bookmarkCheckbox = document.createElement('input');
  bookmarkCheckbox.type = 'checkbox';
  bookmarkCheckbox.className = 'bookmark';
  bookmarkCheckbox.addEventListener('click', () =>
    onBookmarkChanged(bookmarkCheckbox.checked, subject.code)
  );
  bookmarkCheckbox.id = `bookmark-${subject.code}`;
  bookmarkCheckbox.value = subject.code;

  tr.append(
    createColumn(
      courseCodeElement(subject.code),
      lineBreak(),
      courseNameElement(subject.name),
      lineBreak(),
      anchorOfficial,
      anchorMirror,
      bookmarkCheckbox
    ),
    createColumn(courseCreditElement(subject.credit), lineBreak(), `${subject.year}年次`),
    createColumn(subject.termStr, lineBreak(), subject.periodStr),
    createColumn(...subject.room.split(/,/g).flatMap((it) => [it, lineBreak()])),
    createColumn(...subject.person.split(/,/g).flatMap((it) => [it, lineBreak()])),
    subject.classMethods.length < 1
      ? createColumn('不詳')
      : createColumn(...subject.classMethods.flatMap((it) => [it, lineBreak()])),
    createColumn(courseAbstractElement(subject.abstract)),
    createColumn(subject.note)
  );

  return tr;
}

/**
 * ヘルパー関数
 * @param {(string | Node)[]} content tdの中にchildrenとして入るDOM Nodeまたは文字列
 */
function createColumn(...content: (string | Node)[]) {
  const td = document.createElement('td');
  td.append(...content);
  return td;
}

const courseCodeElement = (courseCode: string) => {
  const span = document.createElement('span');
  span.className = 'course-code';
  span.innerText = courseCode
  span.setAttribute("itemprop", "courseCode")
  return span;
}

const courseNameElement = (courseName: string) => {
  const span = document.createElement('span');
  span.className = 'course-name';
  span.innerText = courseName
  span.setAttribute("itemprop", "name")
  return span;
}

const courseCreditElement = (courseCredit: number) => {
  const span = document.createElement('span');
  span.className = 'course-credit';
  span.innerText = `${courseCredit.toFixed(1)}単位`
  span.setAttribute("itemprop", "numberOfCredits")
  return span;
}

const createAnchorOfficial = (subject: Subject) => {
  const anchor = document.createElement('a');
  anchor.href = subject.syllabusHref;
  anchor.className = 'link';
  anchor.target = '_blank';
  anchor.append('シラバス');
  return anchor;
};

const createAnchorMirror = (code: string, name: string) => {
  const anchor = document.createElement('a');
  anchor.href = `https://make-it-tsukuba.github.io/alternative-tsukuba-syllabus/syllabus/${code}.html`;
  anchor.className = 'link';
  anchor.target = '_blank';
  anchor.append('シラバス（ミラー）');
  anchor.addEventListener('click', (evt) => {
    evt.preventDefault();
    let win = document.createElement('draggable-window');
    win.innerHTML = `<div slot='title'>${name} - シラバス</div><iframe slot='body' src='${anchor.href}' />`;
    document.body.append(win);
  });
  return anchor;
};

const courseAbstractElement = (abstract: string) => {
  const p = document.createElement('p');
  p.className = 'course-note';
  p.innerText = abstract
  p.setAttribute("itemprop", "abstract")
  return p;
}

export function renderSubjectForMobile(subject: Subject, isFirst: boolean) {
  const div = document.createElement('div');
  div.className = 'subject';

  const abstract = document.createElement('div');
  abstract.className = 'abstract';

  const left = document.createElement('div');
  let classMethod = subject.classMethods.length > 0 ? subject.classMethods.join('・') : '不詳';
  left.className = 'left';
  left.innerHTML = `<div class="first">${
    subject.code
  }<span class="class-method">${classMethod}</span></div><strong>${
    subject.name
  }</strong><br/>${subject.person.replaceAll(',', '、')}`;

  const right = document.createElement('div');
  right.className = 'right';
  right.innerHTML = `${subject.termStr} ${subject.periodStr}<br/>
  ${subject.credit.toFixed(1)}<span class="sub">単位</span>
  ${subject.year}<span class="sub">年次</span></br>${subject.room.replaceAll(',', ', ')}`;

  // details
  const details = document.createElement('div');
  details.className = 'details';

  const abstractParagraph = document.createElement('p');
  abstractParagraph.innerHTML = `${subject.abstract}`;

  const anchors = document.createElement('div');
  anchors.className = 'anchors';

  const addBookmark = document.createElement('a');
  const removeBookmark = document.createElement('a');

  addBookmark.className = 'link add-bookmark';
  addBookmark.id = `add-bookmark-${subject.code}`;
  addBookmark.append('お気に入りに追加');
  addBookmark.addEventListener('click', () => {
    onBookmarkChanged(true, subject.code);
    addBookmark.style.display = 'none';
    removeBookmark.style.display = 'block';
  });

  removeBookmark.id = `remove-bookmark-${subject.code}`;
  removeBookmark.className = 'link bookmark';
  removeBookmark.append('★お気に入り');
  removeBookmark.addEventListener('click', () => {
    onBookmarkChanged(false, subject.code);
    addBookmark.style.display = 'block';
    removeBookmark.style.display = 'none';
  });

  const anchorOfficial = createAnchorOfficial(subject);
  const anchorMirror = createAnchorMirror(subject.code, subject.name);

  anchors.appendChild(addBookmark);
  anchors.appendChild(removeBookmark);
  anchors.appendChild(anchorOfficial);
  anchors.appendChild(anchorMirror);
  details.appendChild(abstractParagraph);
  details.appendChild(anchors);

  abstract.appendChild(left);
  abstract.appendChild(right);
  div.appendChild(abstract);
  div.appendChild(details);

  let firstNotation: HTMLParagraphElement | null = null;
  if (isFirst) {
    firstNotation = document.createElement('p');
    firstNotation.className = 'first-notation';
    firstNotation.innerHTML = '科目をタップして詳細を表示します';
    div.appendChild(firstNotation);
  }

  div.addEventListener('click', () => {
    if (!details.classList.contains('displayed')) {
      details.classList.add('displayed');
      if (isFirst) {
        firstNotation!.style.display = 'none';
      }
    }
  });

  return div;
}
