import { useState, useMemo } from "react";
import "./TrackMetadataModal.css";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    AlignmentType,
    BorderStyle,
    WidthType,
    ShadingType,
} from "docx";
import { saveAs } from "file-saver";



const ToneSelector = ({ val, set }) => (
    <div className="tone-selector">
        {KEYS.map(note => (
            <div
                key={note}
                className={`tone-option${val === note ? " selected" : ""}`}
                onClick={() => set(note)}
            >
                {note}
            </div>
        ))}
    </div>
);

const AlterationSelector = ({ val, set }) => (
    <div className="alteration-selector">
        {[
            ["sharp", "#"],
            ["flat", "♭"],
            ["nat", "♮"]
        ].map(([v, label]) => (
            <div
                key={v}
                className={`alteration-option${val === v ? " selected" : ""}`}
                onClick={() => set(v)}
            >
                {label}
            </div>
        ))}
    </div>
);

const ModeSelector = ({ val, set }) => (
    <div className="mode-selector">
        {[
            ["minor", "Минор"],
            ["major", "Мажор"]
        ].map(([v, label]) => (
            <div
                key={v}
                className={`mode-option${val === v ? " selected" : ""}`}
                onClick={() => set(v)}
            >
                {label}
            </div>
        ))}
    </div>
);

export function LabelTip({ tip }) {
    const [show, setShow] = useState(false);

    return (
        <span className="label-tip">
            <span
                className="tip-icon"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                onClick={e => { e.preventDefault(); setShow(v => !v); }}
                tabIndex={0}
            >?</span>
            {show && (
                <div className="tip-bubble">
                    {tip}
                </div>
            )}
        </span>
    );
}

export const tips = {
    mainType: `Используйте этот параметр, если для композиции необходимо задать метаданные, характерные для классической музыки.`,

    addClsType: `Выберите "Опера" для композиции из оперы. Выберите "Другая классическая музыка" для всех других жанров классики.`,

    workTitle: `Ввести название произведения, не указывая тональности, опуса или номера в каталоге. 
Пример: Соната для скрипки и фортепиано № 5, до минор, Оп. 67, "Патетическая": I. Ларго`,

    version: `Укажите подзаголовок, если требуется. Например: Acoustic Version, Live at Wembley 1979 и т.д.`,

    composer: `Введите Фамилию и Имя композитора. Можно добавить несколько композиторов — для этого используйте дополнительные поля.`,

    author: `Введите автора слов. Если слов несколько — разделяйте их запятыми или используйте дополнительные поля.`,

    arranger: `Введите аранжировщика (если есть).`,

    remixer: `Введите автора ремикса (если есть).`,

    mainPerformer: `Введите основного исполнителя (например, оркестр, ансамбль, исполнитель-солист).`,

    featured: `Введите приглашённых исполнителей, если есть (feat.).`,

    orchestra: `Введите название оркестра или хора (если есть).`,

    conductor: `Введите Фамилию и Имя дирижёра.`,

    soloist: `Введите имя и фамилию солиста (исполнителя).`,

    pline: `Укажите год и владельца смежных прав (например: 2024 Mishka Records).`,

    year: `Год записи произведения (например, 2024).`,

    publisher: `Название издателя релиза, если есть.`,

    isrc: `Международный стандартный код записи. Формат: XX-0X0-00-00000. Пример: RU-V230-21-00001`,

    autoIsrc: `Если у вас нет собственного ISRC, выберите "Да", чтобы мы присвоили код автоматически.`,

    musicGenre: `Выберите жанр музыки, который наиболее соответствует стилю данной композиции.`,

    clsGenre: `Выберите жанр классической музыки, к которому относится произведение.`,

    subGenre: `Можно указать поджанр или дополнительную информацию о жанре произведения.`,

    extraGenre: `Можно выбрать дополнительный жанр, если трек совмещает несколько стилей.`,

    price: `Выберите ценовую категорию для трека (Back — минимальная цена, Front — максимальная).`,

    labelCatalog: `Внутренний номер релиза или каталога лейбла (если есть).`,

    explicit: `Отметьте, если в тексте композиции присутствует ненормативная лексика.`,

    previewStart: `Укажите момент (в секундах), с которого будет начинаться фрагмент для предпрослушивания. Например: 60.000`,

    titleLang: `Выберите язык названия композиции.`,

    lyricsLang: `Выберите язык текста песни (если есть).`,

    lyrics: `Введите полный текст песни. Если текста нет, оставьте поле пустым.`,

    addMusicType: `Укажите тип композиции: оригинал, кавер, караоке, попурри и т.д.`,

    instrumental: `Отметьте "Да", если композиция является инструментальной (без вокала).`,

    keySpecified: `Снимите галочку, если тональность неизвестна или не требуется указывать.`,

    key: `Если Вы не хотите указывать тональность, нажмите "Тональность не указана"`,

    acc: `Выберите знак альтерации (диез, бемоль, бекар) для указанной тональности.`,

    mode: `Укажите лад: мажор или минор.`,

    opus: `Введите только номер опуса (например: 67). Не пишите "Op." — оно добавится автоматически.`,

    catalog: `Введите номер в каталоге, например: BWV 1001 (для Баха), K 525 (для Моцарта) и т.д.`,

    nickname: `Псевдоним — дополнительное название произведения (например: Лунный свет). Кавычки будут добавлены автоматически.`,

    partNumber: `Введите только номер части арабскими цифрами (например: 1). Он будет преобразован в римскую цифру.`,

    partTitle: `Введите название части или темп (например: Ларго, Allegro, Moderato).`,

    operaTitle: `Введите полное название оперы.`,

    operaExcerpt: `Если трек — отрывок из оперы, укажите его название или описание (например: Ария Ленского).`,

    operaAct: `Введите номер акта оперы (если есть).`,

    operaScene: `Введите номер сцены оперы (если есть).`,

    character: `Укажите персонажа, если композиция исполняется определённым персонажем оперы.`,

    mainPerformerInstrument: `Выберите инструмент основного исполнителя (если актуально).`,

    soloInstrument: `Укажите инструмент солиста (если есть).`,

    singerInstrument: `Укажите инструмент певца (если есть).`,

    composer_meta: `Введите композитора для метаданных (например, если оригинальный композитор отличается от указанного выше).`,

    oeuvreType: `Укажите, является ли произведение целым (например, вся соната) или это часть произведения (например, 2-я часть симфонии).`,

    subType: `A — Симфония, концерт, сюита или соната
B — Этюд, часть сборника или темы и вариаций
C — Месса, балет, этническая музыка, средневековая музыка, прелюдия, фуга или музыка эпохи Возрождения`,

    // ... если встретишь поля без подсказок, их можно не дублировать.
};





const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 126 }, (_, i) => currentYear - i);
const KEYS = [
    "C","D","E","F","G","A","B",
];
const CLS_GENRES = ["Classical","Romantic","Baroque","Contemporary","Early Music"];
const CLS_SUBGENRES = [
    "Classical - Solo Piano","Classical - Symphony","Classical - Concerto",
    "Classical - Chamber Music","Classical - Opera","Classical - Choral",
    "Classical - Solo Instrument",
];
const MUSIC_GENRES = [
    "African","Alternative","Arabic","Asian","Blues","Brazilian","Children Music",
    "Christian & Gospel","Classical","Country","Dance","Easy Listening","Electronic",
    "Folk","Hip Hop/Rap","Indian","Jazz","Latin","Metal","Pop","R&B/Soul","Reggae",
    "Relaxation","Rock","Various","World Music / Regional Folklore",
]

const LANGUAGES = [
    "Russian","English","German","Italian","French","Latin","Spanish","zxx",
];
const INSTRUMENTS = [
    "Piano","Violin","Cello","Flute","Oboe","Clarinet","Trumpet","Guitar","Organ","Voice",
];
const PRICES = ["Back : 10руб / 0.69$ / 0.69€",
    "Mid : 15руб / 0.99$ / 0.99€",
    "Front : 19руб / 1.29$ / 1.29€"];

export default function TrackMetadataModal() {
    const [open, setOpen] = useState(true);
    const [form, setForm] = useState({
        contentType: "audio",
        mainType: "classical",
        addMusicType: "original",
        addClsType: "other",
        whole: true,
        subType: "A",
        instrumental: false,
        keySpecified: true,
        musicGenre: "—",
        clsGenre: "Classical",
        /* ---- multi‑value contributor fields ---- */
        composer: [""],
        orchestra: [""],
        conductor: [""],
        soloist: [""],
        singer: [""],
        featured: [""],
        remixer: [""],
        author: [""],
        composer_meta: [""],
        arranger: [""],
        character: [""],
        mainPerformer: [""],

        /* ---- the rest remain scalar ---- */
        workTitle: "",
        vrsn: "",
        mainPerformerInstrument: "",
        soloInstrument: "",
        singerInstrument: "",
        remixerInstrument: "",
        pline: "",
        year: "",
        publisher: "",
        isrc: "",
        autoIsrc: false,
        subGenre: "",
        extraGenre: "",
        price: "",
        labelCatalog: "",
        explicit: "no",
        previewStart: "120.000",

        /* classical‑specific scalar fields */
        workNumber: "",
        key: "C",
        acc: "nat",
        mode: "major",
        opus: "",
        catalog: "",
        nickname: "",
        partNumber: "",
        partTitle: "",
        operaTitle: "",
        operaExcerpt: "",
        operaAct: "",
        operaScene: "",
    });


    // ---------- DOCX export ----------
    const handleExportDocx = () => {
        // фирменные цвета MistyMeadowRecords
        const BRAND      = { main: "6FAE8C", alt: "DDEAE2" };
        const FONT       = "Calibri";

        /* 1. Сбор данных (без пустых) */
        const normalized = Object.fromEntries(
            Object.entries(form)
                .filter(([_, v]) =>
                    Array.isArray(v) ? v.some(Boolean) : v != null && v !== ""
                )
                .map(([k, v]) => [
                    k,
                    Array.isArray(v)
                        ? v.filter(Boolean).join(", ")
                        : typeof v === "boolean"
                            ? v ? "Да" : "Нет"
                            : String(v),
                ])
        );

        /* 2. Хелперы */
        const run = (text, extra = {}) => new TextRun({ text, font: FONT, ...extra });

        const headerCell = (t) =>
            new TableCell({
                shading: {
                    type: ShadingType.CLEAR,
                    color: "auto",           // обязательно!
                    fill: BRAND.alt,
                },
                children: [new Paragraph({ children: [run(t, { bold: true })] })],
            });

        const cell = (t) => new TableCell({ children: [new Paragraph({ children: [run(t) ]})] });

        /* 3. Таблица */
        const rows = [
            new TableRow({ tableHeader: true, children: [headerCell("Поле"), headerCell("Значение")] }),
            ...Object.entries(normalized).map(([k, v]) => new TableRow({ children: [cell(k), cell(v)] })),
        ];

        const table = new Table({
            rows,
            borders: {
                top:               { style: BorderStyle.SINGLE, size: 2, color: BRAND.main },
                bottom:            { style: BorderStyle.SINGLE, size: 2, color: BRAND.main },
                left:              { style: BorderStyle.SINGLE, size: 2, color: BRAND.main },
                right:             { style: BorderStyle.SINGLE, size: 2, color: BRAND.main },
                insideHorizontal:  { style: BorderStyle.SINGLE, size: 1, color: BRAND.alt },
                insideVertical:    { style: BorderStyle.SINGLE, size: 1, color: BRAND.alt },
            },
        });

        /* 4. Документ */
        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 300 },
                            children: [run("Misty Meadow Records", { bold: true, color: BRAND.main, size: 48 })],
                        }),
                        new Paragraph({
                            spacing: { after: 100 },
                            children: [run(preview || "—", { bold: true, size: 32 })],
                        }),
                        new Paragraph({
                            spacing: { after: 300 },
                            children: [run(authors || "—", { italics: true, size: 24 })],
                        }),
                        table,
                    ],
                },
            ],
        });

        /* 5. Сохраняем */
        Packer.toBlob(doc).then((blob) => saveAs(blob, "track_metadata.docx"));
    };

    const upd = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

    /* ========== flags ========== */
    const cls = form.mainType === "classical";
    const opera = form.addClsType === "opera";
    const part = !form.whole;
    const subtype = cls && part && !opera;
    const keyBlock = cls && !opera && form.keySpecified;
    const vocal = !form.instrumental;
    const music = form.mainType === "music";

    /* ========== preview generator ========== */
    const preview = useMemo(() => {
        const concat = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).join(", ") : arr || "");
        const composerNames = concat(form.composer);
        const characterNames = concat(form.character);

        if (cls) {
            if (opera) {
                const c = composerNames ? `${composerNames}: ` : "";
                const o = form.operaTitle || "";
                const opus = form.opus ? `, Op. ${form.opus}` : "";
                const cat = form.catalog ? `, ${form.catalog}` : "";
                const an = form.operaAct ? `, Act ${form.operaAct}` : "";
                const sn = form.operaScene ? `, Scene ${form.operaScene}` : "";
                const ex = form.operaExcerpt ? `: "${form.operaExcerpt}"` : "";
                const character = characterNames ? ` (${characterNames})` : "";
                const v = form.vrsn ? ` [${form.vrsn}]` : "";
                return `${c}${o}${opus}${cat}${an}${sn}${ex}${character}${v}`.trim();
            }
            const composer = composerNames ? `${composerNames}: ` : "";
            const work = form.workTitle || "";
            const workNumber = form.workNumber ? ` No. ${form.workNumber}` : "";
            const key =
                keyBlock && form.key
                    ? ` in ${form.key}${
                        form.acc === "sharp" ? "-Sharp" : form.acc === "flat" ? "-Flat" : ""
                    } ${form.mode === "minor" ? "Minor" : "Major"}`
                    : "";
            const opus = form.opus ? `, Op. ${form.opus}` : "";
            const cat = form.catalog ? `, ${form.catalog}` : "";
            const nick = form.nickname ? ` "${form.nickname}"` : "";
            const partNo = form.partNumber ? `: ${form.partNumber}.` : "";
            const partTitle = form.partTitle ? (partNo !== "" ? ` ${form.partTitle}` : `: ${form.partTitle}`) : "";
            const ver = form.vrsn ? ` (${form.vrsn})` : "";
            return `${composer}${work}${workNumber}${key}${opus}${cat}${nick}${partNo}${partTitle}${ver}`.trim();
        }

        if (music) {
            const composer = composerNames ? `${composerNames}: ` : "";
            const work = form.workTitle || "";
            const cat = form.catalog ? `, ${form.catalog}` : "";
            const ver = form.vrsn ? ` (${form.vrsn})` : "";
            return `${composer}${work}${cat}${ver}`.trim();
        }
    }, [form, cls, music, keyBlock, opera]);

    /* ========== authors line ========== */
    const authors = useMemo(() => {
        const collect = (src) => (Array.isArray(src) ? src.filter(Boolean) : src ? [src] : []);

        const parts = [
            ...collect(form.author),
            ...collect(form.orchestra),
            ...collect(form.conductor),
            ...collect(form.soloist),
            ...collect(form.singer),
        ];

        let base = parts.join(", ");

        const featList = collect(form.featured);
        if (featList.length) base += ` (feat. ${featList.join(", ")})`;

        if (cls) return base.trim();
        if (music) return `${collect(form.author).join(", ")}${
            featList.length ? ` (feat. ${featList.join(", ")})` : ""
        }`.trim();

        return "";
    }, [form, cls, music]);


    return (
        <>
            {open && (
                <div className="dialog-overlay">
                    <div className="dialog" onClick={e => e.stopPropagation()}>
                        <h2 className="dialog-title">Метаданные трека</h2>
                        {/* content type */}
                        {/*<Field label="Тип контента">*/}
                        {/*    <RG val={form.contentType} set={upd("contentType")}*/}
                        {/*        opts={{audio: "Аудио", video: "Видео"}}/>*/}
                        {/*</Field>*/}
                        {/* main type */}
                        <Field label="Основной тип композиции" tip={tips.mainType}>
                            <RG
                                val={form.mainType}
                                set={v => v !== "classical" ? setForm(p => ({
                                    ...p,
                                    mainType: v,
                                })) : upd("mainType")(v)}
                                opts={{music: "Музыка", classical: "Классическая музыка"}}
                            />
                        </Field>

                        {music && (
                            <>
                                <Field label="Дополнительный тип композиции" tip={tips.addClsType}>
                                    <RG
                                        val={form.addMusicType}
                                        set={upd("addMusicType")}
                                        opts={{
                                            original: "Оригинал",
                                            karaoke: "Караоке",
                                            potpourri: "Попурри",
                                            cover: "Кавер-версия",
                                            coverBand: "В исполнении кавер-группы"
                                        }}
                                    />
                                </Field>
                                <Field label="Инструментальная">
                                    <RG
                                        val={form.instrumental ? "yes" : "no"}
                                        set={v => upd("instrumental")(v === "yes")}
                                        opts={{yes: "Да", no: "Нет"}}
                                    />
                                </Field>
                                <MultiInputField label="Автор" req val={form.author} set={upd("author")}/>
                                <InputField label="Название" req
                                            val={form.workTitle}
                                            set={upd("workTitle")}
                                />
                                <InputField label="Версия/Подзаголовок"
                                            val={form.vrsn}
                                            set={upd("vrsn")}
                                />

                                <Preview track={preview} authors={authors}/>
                                <div className="export-row">
                                    <button type="button" className="export-btn" onClick={handleExportDocx}>
                                        Экспорт в DOCX
                                    </button>
                                </div>


                                <Field>

                                    <InputField label="Основной исполнитель" val={form.mainPerformer}
                                                set={upd("mainPerformer")}/>
                                    <Field label="Инструмент исполнителя">
                                        <Sel
                                            val={form.mainPerformerInstrument}
                                            set={upd("mainPerformerInstrument")}
                                            ph="—"
                                            arr={INSTRUMENTS}
                                        />
                                    </Field>

                                </Field>
                                <MultiInputField label="Приглашенный исполнитель" val={form.featured}
                                                 set={upd("featured")}/>
                                <MultiInputField label="Автор ремикса" val={form.remixer} set={upd("remixer")}/>
                                <MultiInputField label="Композитор (meta_data)" val={form.composer_meta}
                                                 set={upd("composer_meta")}/>
                                <MultiInputField label="Аранжировщик" val={form.arranger} set={upd("arranger")}/>

                                {/* rights */}
                                <InputField label="℗ PLine" req val={form.pline} set={upd("pline")}/>
                                <Field label="Год записи" req><Sel val={form.year} set={upd("year")} ph="—"
                                                                   arr={YEARS}/></Field>
                                <InputField label="Издатель" val={form.publisher} set={upd("publisher")}/>
                                <InputField label="ISRC" val={form.isrc} set={upd("isrc")}/>
                                <Field label="Попросить присвоить ISRC"><RG val={form.autoIsrc ? "yes" : "no"}
                                                                            set={v => upd("autoIsrc")(v === "yes")}
                                                                            opts={{yes: "Да", no: "Нет"}}/></Field>

                                {/* genre */}
                                <Field label="Жанр" req><Sel val={form.musicGenre} set={upd("musicGenre")} ph="—"
                                                             arr={MUSIC_GENRES}/></Field>
                                <InputField label="Поджанр" val={form.subGenre} set={upd("subGenre")}/>
                                <Field label="Дополнительный жанр"><Sel val={form.extraGenre} set={upd("extraGenre")}
                                                                        ph="—"
                                                                        arr={MUSIC_GENRES}/></Field>
                                <Field label="Уровень цен" req><Sel val={form.price} set={upd("price")} ph="—"
                                                                    arr={PRICES}/></Field>
                                <InputField label="Номер в каталоге" val={form.labelCatalog} set={upd("labelCatalog")}/>

                                <Field label="Присутствие ненормативной лексики"><RG val={form.explicit || "no"}
                                                                                     set={upd("explicit")} opts={{
                                    yes: "Да",
                                    no: "Нет",
                                    clean: "Чистая версия"
                                }}/></Field>
                                <InputField label="Начало превью / фрагмента" val={form.previewStart}
                                            set={upd("previewStart")}
                                            def="120.000"/>

                                <Field label="Язык названия композиции" req><Sel val={form.titleLang}
                                                                                 set={upd("titleLang")}
                                                                                 ph="—" arr={LANGUAGES}/></Field>
                                {vocal && (
                                    <>
                                        <Field label="Язык слов песни" req><Sel val={form.lyricsLang}
                                                                                set={upd("lyricsLang")}
                                                                                ph="—" arr={LANGUAGES}/></Field>
                                        <Field label="Текст песни"><textarea className="textarea"
                                                                             value={form.lyrics || ""}
                                                                             onChange={e => upd("lyrics")(e.target.value)}
                                                                             rows={3}/></Field>
                                    </>
                                )}
                            </>
                        )}
                        {cls && (
                            <>
                                <Field label="Дополнительный тип композиции" tip={tips.addClsType}>
                                    <RG val={form.addClsType} set={upd("addClsType")}
                                        opts={{opera: "Опера", other: "Другая классическая музыка"}}/>
                                </Field>
                                {!opera && (
                                    <Field label="Данная композиция – это">
                                        <RG val={form.whole ? "whole" : "part"} set={v => upd("whole")(v === "whole")}
                                            opts={{whole: "произведение целиком", part: "часть произведения"}}/>
                                    </Field>
                                )}

                                {subtype && (
                                    <Field label="Данное произведение – это">
                                        <SubtypeRG val={form.subType} set={upd("subType")}
                                                   opts={{
                                                       A: "A - Симфония, концерт, сюита или соната",
                                                       B: "B - Этюд, часть сборника или темы и вариаций",
                                                       C: <>C - Месса, балет, этническая музыка, средневековая
                                                           музыка,<br/>
                                                           прелюдия, фуга или музыка эпохи Возрождения</>
                                                   }}/>
                                    </Field>
                                )}
                                <Field label="Инструментальная">
                                    <RG val={form.instrumental ? "yes" : "no"}
                                        set={v => upd("instrumental")(v === "yes")}
                                        opts={{yes: "Да", no: "Нет"}}/>
                                </Field>

                                {/* titles */}
                                <MultiInputField label="Композитор" val={form.composer} set={upd("composer")}/>
                                {!opera &&
                                    <InputField label="Название произведения" req tip={tips.workTitle}
                                                val={form.workTitle} set={upd("workTitle")}/>}
                                {opera &&
                                    <InputField label="Название оперы" req val={form.operaTitle}
                                                set={upd("operaTitle")}/>}
                                {opera &&
                                    <InputField label="Название отрывка" val={form.operaExcerpt}
                                                set={upd("operaExcerpt")}/>}

                                {!opera && (
                                    <InputField label="Номер произведения" val={form.workNumber}
                                                set={upd("workNumber")}/>
                                )}
                                {!opera &&
                                    <InputField label="Псевдоним (доп. название)" val={form.nickname}
                                                set={upd("nickname")}/>}
                                {part && !opera && (
                                    <>
                                        <InputField label="Номер части" val={form.partNumber} set={upd("partNumber")}/>
                                        <InputField label="Название части или темп" val={form.partTitle}
                                                    set={upd("partTitle")}/>
                                    </>
                                )}
                                {cls && !opera && (
                                    <InputField label="Версия/Подзаголовок" val={form.vrsn} set={upd("vrsn")}/>
                                )}


                                {(cls && !opera) && (
                                    <div className="key-toggle">
                                        <input id="nokey" type="checkbox" checked={!form.keySpecified}
                                               onChange={e => upd("keySpecified")(!e.target.checked)}/>
                                        <label htmlFor="nokey">Тональность не указана</label>
                                    </div>
                                )}


                                {/* key */}
                                {keyBlock && (
                                    <>

                                        {form.keySpecified && (
                                            <>
                                                <Field label="Тональность" req tip={tips.key}>
                                                    <ToneSelector val={form.key} set={upd("key")}/>
                                                </Field>
                                                <Field label="Знак альтерации">
                                                    <AlterationSelector val={form.acc || "nat"} set={upd("acc")}/>
                                                </Field>
                                                <Field label="Лад">
                                                    <ModeSelector val={form.mode || "major"} set={upd("mode")}/>
                                                </Field>
                                            </>
                                        )}
                                    </>
                                )}

                                <InputField label="Номер опуса" val={form.opus} set={upd("opus")} tip={tips.opus}/>
                                <InputField label="Номер в каталоге" val={form.catalog} set={upd("catalog")}
                                            tip={tips.catalog}/>
                                {opera && (
                                    <>
                                        <InputField label="Номер акта" val={form.operaAct} set={upd("operaAct")}/>
                                        <InputField label="Номер сцены" val={form.operaScene} set={upd("operaScene")}/>
                                        <MultiInputField label="Персонаж" val={form.character} set={upd("character")}/>
                                        <InputField label="Версия/Подзаголовок" val={form.vrsn} set={upd("vrsn")}/>

                                    </>
                                )}

                                <Preview track={preview} authors={authors}/>
                                <div className="export-row">
                                    <button type="button" className="export-btn" onClick={handleExportDocx}>
                                        Экспорт в DOCX
                                    </button>
                                </div>


                                {/* contributors */}
                                <MultiInputField label="Оркестр или хор" val={form.orchestra} set={upd("orchestra")}/>
                                <MultiInputField label="Дирижер" val={form.conductor} set={upd("conductor")}/>
                                <MultiInputField label="Солист" val={form.soloist} set={upd("soloist")}/>
                                <Field label="Инструмент солиста"><Sel val={form.soloInstrument}
                                                                       set={upd("soloInstrument")}
                                                                       ph="—" arr={INSTRUMENTS}/></Field>
                                {vocal && (
                                    <>
                                        <MultiInputField label="Певец" val={form.singer} set={upd("singer")}/>
                                        <Field label="Инструмент певца"><Sel val={form.singerInstrument}
                                                                             set={upd("singerInstrument")} ph="—"
                                                                             arr={INSTRUMENTS}/></Field>
                                    </>
                                )}
                                <MultiInputField label="Приглашенный исполнитель" val={form.featured}
                                                 set={upd("featured")}/>
                                <MultiInputField label="Автор ремикса" val={form.remixer} set={upd("remixer")}/>
                                <MultiInputField label="Автор" req val={form.author} set={upd("author")}/>
                                <MultiInputField label="Композитор (meta_data)" req val={form.composer_meta}
                                                 set={upd("composer_meta")}/>
                                <MultiInputField label="Аранжировщик" val={form.arranger} set={upd("arranger")}/>

                                {/* rights */}
                                <InputField label="℗ PLine" req val={form.pline} set={upd("pline")}/>
                                <Field label="Год записи" req><Sel val={form.year} set={upd("year")} ph="—"
                                                                   arr={YEARS}/></Field>
                                <InputField label="Издатель" val={form.publisher} set={upd("publisher")}/>
                                <InputField label="Международный стандартный код записи (ISRC)"
                                            placeholder="XX-0X0-00-00000" val={form.isrc} set={upd("isrc")}/>
                                <Field label="Попросить присвоить ISRC"><RG val={form.autoIsrc ? "yes" : "no"}
                                                                            set={v => upd("autoIsrc")(v === "yes")}
                                                                            opts={{yes: "Да", no: "Нет"}}/></Field>

                                {/* genre */}
                                <Field label="Жанр" req><Sel val={form.clsGenre} set={upd("clsGenre")} ph="Classical"
                                                             arr={CLS_GENRES}/></Field>
                                <Field label="Поджанр" req><Sel val={form.subGenre} set={upd("subGenre")} ph="—"
                                                                arr={CLS_SUBGENRES}/></Field>
                                <Field label="Дополнительный жанр"><Sel val={form.extraGenre} set={upd("extraGenre")}
                                                                        ph="—"
                                                                        arr={CLS_SUBGENRES}/></Field>
                                <Field label="Уровень цен" req><Sel val={form.price} set={upd("price")} ph="—"
                                                                    arr={PRICES}/></Field>
                                <InputField label="Номер в каталоге" val={form.labelCatalog} set={upd("labelCatalog")}/>

                                <Field label="Присутствие ненормативной лексики"><RG val={form.explicit || "no"}
                                                                                     set={upd("explicit")} opts={{
                                    yes: "Да",
                                    no: "Нет",
                                    clean: "Чистая версия"
                                }}/></Field>
                                <InputField label="Начало превью / фрагмента" val={form.previewStart}
                                            set={upd("previewStart")}
                                            def="120.000"/>

                                <Field label="Язык названия композиции" req><Sel val={form.titleLang}
                                                                                 set={upd("titleLang")}
                                                                                 ph="—" arr={LANGUAGES}/></Field>
                                {vocal && (
                                    <>
                                        <Field label="Язык слов песни" req><Sel val={form.lyricsLang}
                                                                                set={upd("lyricsLang")}
                                                                                ph="—" arr={LANGUAGES}/></Field>
                                        <Field label="Текст песни"><textarea className="textarea"
                                                                             value={form.lyrics || ""}
                                                                             onChange={e => upd("lyrics")(e.target.value)}
                                                                             rows={3}/></Field>
                                    </>
                                )}

                            </>
                        )}


                    </div>
                </div>
            )}
        </>
    );
}

/* ===== helpers ===== */
const Field = ({label, tip, children, req}) => (
    <div className="field">
        <label className="label">
            {label}{req && <span className="label-required">*</span>}
            {tip && <LabelTip tip={tip} />}
        </label>
        {children}
    </div>
);


const InputField = ({ label, placeholder, tip, req, val, set, def = "" }) => (
    <Field label={label} req={req} tip={tip}>
        <input className="input" placeholder={placeholder} value={val ?? def} onChange={e => set(e.target.value)} />
    </Field>
);

const MultiInputField = ({ label, req, val, set }) => (

    <Field>
            <label className="multi-input-label">{label}{req && <span className="label-required">*</span>}</label>
            {val.map((v, i) => (
                <div className="multi-input-field">
                <div key={i} className="multi-input-row">
                    <input
                        className="input"
                        value={v}
                        onChange={(e) => {
                            const next = [...val];
                            next[i] = e.target.value;
                            set(next);
                        }}
                    />
                    <button
                        type="button"
                        className="add-btn"
                        onClick={() => set([...val, ""])}
                    >
                        +
                    </button>
                    {i !== 0 && (
                        <button
                            type="button"
                            className="remove-btn"
                            onClick={() => {
                                const next = val.filter((_, idx) => idx !== i);
                                set(next.length ? next : [""]); // keep at least one field
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
                </div>

            ))}
    </Field>
);


const RG = ({
                val, set, opts
            }) => (
    <div className="radio-group" onChange={e => set(e.target.value)}>
        {Object.entries(opts).map(([v, l]) => (
            <label key={v} className="radio-option"><input type="radio" name={Math.random()} value={v} checked={val===v} onChange={() => {}} /> {l}</label>
        ))}
    </div>
);

const SubtypeRG = ({ val, set, opts }) => (
    <div className="subtype-radio-group" onChange={e => set(e.target.value)}>
        {Object.entries(opts).map(([v, l]) => (
            <label key={v} className="subtype-radio-option"><input type="radio" name={Math.random()} value={v} checked={val===v} onChange={() => {}} /> {l}</label>
        ))}
    </div>
);

const Sel = ({ val, set, ph, arr }) => (
    <select className="select" value={val ?? ""} onChange={e => set(e.target.value)}>
        <option value="" disabled>{ph}</option>
        {arr.map(i => <option key={i} value={i}>{i}</option>)}
    </select>
);

const Preview = ({ track, authors }) => (
    <div className="preview">
        <div className="preview-label">Полный предварительный просмотр</div>
        <div className="preview-texts">
            <div className="track-text">{track || "—"}</div>
            <div className="authors-text">{authors || "—"}</div>
        </div>

    </div>
);
