// TrackMetadataModal.jsx — версия без внешних UI‑зависимостей
import { useState, useMemo } from "react";
import "./TrackMetadataModal.css";

const YEARS = Array.from({ length: 126 }, (_, i) => 2025 - i);
const KEYS = [
    "C","D","E","F","G","A","B",
];
const GENRES = ["Classical","Romantic","Baroque","Contemporary","Early Music"];
const SUBGENRES = [
    "Classical - Solo Piano","Classical - Symphony","Classical - Concerto",
    "Classical - Chamber Music","Classical - Opera","Classical - Choral",
    "Classical - Solo Instrument",
];
const LANGUAGES = [
    "Russian","English","German","Italian","French","Latin","Spanish","zxx",
];
const INSTRUMENTS = [
    "Piano","Violin","Cello","Flute","Oboe","Clarinet","Trumpet","Guitar","Organ","Voice",
];
const PRICES = ["Frontline","Mid-price","Budget"];

export default function TrackMetadataModal() {
    const [open, setOpen] = useState(true);
    const [form, setForm] = useState({
        contentType: "audio",
        mainType: "classical",
        addType: "other",
        whole: true,
        subType: "A",
        instrumental: false,
        keySpecified: true,
        genre: "Classical",
    });
    const upd = key => val => setForm(p => ({ ...p, [key]: val }));

    /* flags */
    const cls = form.mainType === "classical";
    const opera = form.addType === "opera";
    const part = !form.whole;
    const subtype = cls && part && !opera;
    const keyBlock = cls && form.keySpecified && !opera;
    const vocal = !form.instrumental;

    /* preview */
    const preview = useMemo(() => {
        if (opera) {
            const o = form.operaTitle || "";
            const an = form.operaAct ? ` Act ${form.operaAct}` : "";
            const sn = form.operaScene ? ` Scene ${form.operaScene}` : "";
            const ex = form.operaExcerpt ? ` — ${form.operaExcerpt}` : "";
            const v = form.vrsn ? ` (${form.vrsn})` : "";
            return `${o}${an}${sn}${ex}${v}`.trim();
        }
        const composer = form.composer ?  `${form.composer}: ` : "";
        const work = form.workTitle || '';
        const key = keyBlock && form.key ?
            ` in ${form.key}${form.acc === "sharp" ? "-Sharp" : form.acc === "flat" ? "-Flat" : ""} ${form.mode === "minor" ? "Minor" : "Major"}` : "";
        const opus = form.opus ? `, Op. ${form.opus}` : "";
        const cat = form.catalog ? `, ${form.catalog}` : "";
        const nick = form.nickname ? ` "${form.nickname}"` : "";
        const partNo = form.partNumber ? `: No. ${form.partNumber}` : "";
        const partTitle = form.partTitle ? (partNo !== '') ? `, ${form.partTitle}` : `: ${form.partTitle}`  : '';
        const ver = form.vrsn ? ` (${form.vrsn})` : "";
        return `${composer}${work}${key}${opus}${cat}${nick}${partNo}${partTitle}${ver}`.trim();
    }, [form, keyBlock, opera]);

    const authors = useMemo(() => {
        const orchestra = form.orchestra || '';
        const conductor = form.conductor ? form.orchestra ? `, ${form.conductor}` : `${form.conductor}` : '';
        const soloist = form.soloist ? form.conductor || form.orchestra ? `, ${form.soloist}` : `${form.soloist}` : '';
        return `${orchestra}${conductor}${soloist}`.trim();
    }, [form]);

    return (
        <>
            {open && (
                <div className="dialog-overlay">
                    <div className="dialog" onClick={e => e.stopPropagation()}>
                        <h2 className="dialog-title">Метаданные трека</h2>
                        {/* content type */}
                        <Field label="Тип контента" req>
                            <RG val={form.contentType} set={upd("contentType")} opts={{ audio: "Аудио", video: "Видео" }} />
                        </Field>
                        {/* main type */}
                        <Field label="Основной тип композиции" req>
                            <RG
                                val={form.mainType}
                                set={v => v !== "classical" ? setForm(p => ({ ...p, mainType: v, addType: "none" })) : upd("mainType")(v)}
                                opts={{ music: "Музыка", classical: "Классическая музыка" }}
                            />
                        </Field>
                        {cls && (
                            <Field label="Дополнительный тип композиции" req>
                                <RG val={form.addType} set={upd("addType")} opts={{ opera: "Опера", other: "Другая классическая музыка" }} />
                            </Field>
                        )}
                        {cls && (
                            <Field label="Данная композиция – это" req>
                                <RG val={form.whole ? "whole" : "part"} set={v => upd("whole")(v === "whole")}
                                    opts={{ whole: "произведение целиком", part: "часть произведения" }} />
                            </Field>
                        )}
                        {subtype && (
                            <Field label="Данное произведение – это" req>
                                <RG val={form.subType} set={upd("subType")} opts={{ A: "A - Симфония...", B: "B - Этюд...", C: "C - Месса/Балет..." }} />
                            </Field>
                        )}
                        <Field label="Инструментальная">
                            <RG val={form.instrumental ? "yes" : "no"} set={v => upd("instrumental")(v === "yes")}
                                opts={{ yes: "Да", no: "Нет" }} />
                        </Field>

                        {/* titles */}
                        <InputField label="Композитор" req val={form.composer} set={upd("composer")} />
                        {!opera && <InputField label="Название произведения" req val={form.workTitle} set={upd("workTitle")} />}
                        {opera && <InputField label="Название оперы" req val={form.operaTitle} set={upd("operaTitle")} />}
                        {opera && <InputField label="Название отрывка" val={form.operaExcerpt} set={upd("operaExcerpt")} />}
                        {part && !opera && (
                            <>
                                <InputField label="Номер части" val={form.partNumber} set={upd("partNumber")} />
                                <InputField label="Название части" val={form.partTitle} set={upd("partTitle")} />
                            </>
                        )}

                        {/* key */}
                        {keyBlock && (
                            <>
                                <div className="key-toggle">
                                    <input id="nokey" type="checkbox" checked={!form.keySpecified} onChange={e => upd("keySpecified")(!e.target.checked)} />
                                    <label htmlFor="nokey">Тональность не указана</label>
                                </div>
                                {form.keySpecified && (
                                    <>
                                        <Field label="Тональность" req>
                                            <Sel val={form.key} set={upd("key")} ph="- выберите -" arr={KEYS} />
                                        </Field>
                                        <Field>
                                            <RG val={form.acc || "nat"} set={upd("acc")} opts={{ sharp: "#", flat: "♭", nat: "♮" }} />
                                        </Field>
                                        <Field>
                                            <RG val={form.mode || "major"} set={upd("mode")} opts={{ minor: "Минор", major: "Мажор" }} />
                                        </Field>
                                    </>
                                )}
                            </>
                        )}

                        {!opera && <InputField label="Номер опуса" val={form.opus} set={upd("opus")} />}
                        {!opera && <InputField label="Номер в каталоге" val={form.catalog} set={upd("catalog")} />}
                        {!opera && <InputField label="Псевдоним (доп. название)" val={form.nickname} set={upd("nickname")} />}
                        {opera && (
                            <>
                                <InputField label="Номер акта" val={form.operaAct} set={upd("operaAct")} />
                                <InputField label="Номер сцены" val={form.operaScene} set={upd("operaScene")} />
                            </>
                        )}
                        <InputField label="Версия/Подзаголовок" val={form.vrsn} set={upd("vrsn")} />

                        <Preview track={preview} authors={authors} />

                        {/* contributors */}
                        <InputField label="Оркестр или хор" val={form.orchestra} set={upd("orchestra")} />
                        <InputField label="Дирижер" val={form.conductor} set={upd("conductor")} />
                        <InputField label="Солист" val={form.soloist} set={upd("soloist")} />
                        <Field label="Инструмент солиста"><Sel val={form.soloInstrument} set={upd("soloInstrument")} ph="—" arr={INSTRUMENTS} /></Field>
                        {vocal && (
                            <>
                                <InputField label="Певец" val={form.singer} set={upd("singer")} />
                                <Field label="Инструмент певца"><Sel val={form.singerInstrument} set={upd("singerInstrument")} ph="—" arr={INSTRUMENTS} /></Field>
                            </>
                        )}
                        <InputField label="Приглашенный исполнитель" val={form.featured} set={upd("featured")} />
                        <InputField label="Автор ремикса" val={form.remixer} set={upd("remixer")} />
                        <InputField label="Автор" val={form.author} set={upd("author")} />
                        <InputField label="Композитор(meta_data)" val={form.composer_meta} set={upd("composer_meta")} />
                        <InputField label="Аранжировщик" val={form.arranger} set={upd("arranger")} />

                        {/* rights */}
                        <InputField label="℗ PLine" req val={form.pline} set={upd("pline")} />
                        <Field label="Год записи" req><Sel val={form.year} set={upd("year")} ph="—" arr={YEARS} /></Field>
                        <InputField label="Издатель" val={form.publisher} set={upd("publisher")} />
                        <InputField label="ISRC" val={form.isrc} set={upd("isrc")} />
                        <Field label="Попросить присвоить ISRC"><RG val={form.autoIsrc ? "yes" : "no"} set={v => upd("autoIsrc")(v === "yes")} opts={{ yes: "Да", no: "Нет" }} /></Field>

                        {/* genre */}
                        <Field label="Жанр" req><Sel val={form.genre} set={upd("genre")} ph="Classical" arr={GENRES} /></Field>
                        <Field label="Поджанр" req><Sel val={form.subGenre} set={upd("subGenre")} ph="—" arr={SUBGENRES} /></Field>
                        <Field label="Дополнительный жанр"><Sel val={form.extraGenre} set={upd("extraGenre")} ph="—" arr={SUBGENRES} /></Field>
                        <Field label="Уровень цен" req><Sel val={form.price} set={upd("price")} ph="—" arr={PRICES} /></Field>
                        <InputField label="Номер в каталоге" val={form.labelCatalog} set={upd("labelCatalog")} />

                        <Field label="Присутствие ненормативной лексики" req><RG val={form.explicit || "no"} set={upd("explicit")} opts={{ yes: "Да", no: "Нет", clean: "Чистая версия" }} /></Field>
                        <InputField label="Начало превью / фрагмента" val={form.previewStart} set={upd("previewStart")} def="120.000" />

                        <Field label="Язык названия композиции" req><Sel val={form.titleLang} set={upd("titleLang")} ph="—" arr={LANGUAGES} /></Field>
                        {vocal && (
                            <>
                                <Field label="Язык слов песни" req><Sel val={form.lyricsLang} set={upd("lyricsLang")} ph="—" arr={LANGUAGES} /></Field>
                                <Field label="Текст песни"><textarea className="textarea" value={form.lyrics || ""} onChange={e => upd("lyrics")(e.target.value)} rows={3} /></Field>
                            </>
                        )}

                    </div>
                </div>
            )}
        </>
    );
}

/* ===== helpers ===== */
const Field = ({ label, children, req }) => (
    <div className="field">
        <label className="label">{label}{req && <span className="label-required">*</span>}</label>
        {children}
    </div>
);

const InputField = ({ label, req, val, set, def = "" }) => (
    <Field label={label} req={req}>
        <input className="input" value={val ?? def} onChange={e => set(e.target.value)} />
    </Field>
);

const RG = ({ val, set, opts }) => (
    <div className="radio-group" onChange={e => set(e.target.value)}>
        {Object.entries(opts).map(([v, l]) => (
            <label key={v} className="radio-option"><input type="radio" name={Math.random()} value={v} checked={val===v} onChange={() => {}} /> {l}</label>
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
