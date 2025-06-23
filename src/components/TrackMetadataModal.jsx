// TrackMetadataModal.jsx — версия без внешних UI‑зависимостей
import { useState, useMemo } from "react";
import "./TrackMetadataModal.css";

const YEARS = Array.from({ length: 126 }, (_, i) => 2025 - i);
const KEYS = [
    "C","C#","Db","D","D#","Eb","E","F","F#","Gb","G","G#","Ab","A","A#","Bb","B",
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
    const [open, setOpen] = useState(false);
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
            const v = form.version ? ` (${form.version})` : "";
            return `${o}${an}${sn}${ex}${v}`.trim();
        }
        const work = form.workTitle || "";
        const partNo = form.partNumber ? ` No.${form.partNumber}` : "";
        const partTitle = form.partTitle ? ` ${form.partTitle}` : "";
        const key = keyBlock && form.key ?
            ` in ${form.key}${form.acc === "sharp" ? "#" : form.acc === "flat" ? "♭" : ""} ${form.mode === "minor" ? "Minor" : "Major"}` : "";
        const opus = form.opus ? `, Op. ${form.opus}` : "";
        const cat = form.catalog ? `, ${form.catalog}` : "";
        const nick = form.nickname ? ` "${form.nickname}"` : "";
        const ver = form.version ? ` (${form.version})` : "";
        return `${work}${partNo}${partTitle}${key}${opus}${cat}${nick}${ver}`.trim();
    }, [form, keyBlock, opera]);

    return (
        <>
            <button className="btn" onClick={() => setOpen(true)}>Track metadata</button>
            {open && (
                <div className="dialog-overlay" onClick={() => setOpen(false)}>
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
                        {!opera && <InputField label="Псевдоним" val={form.nickname} set={upd("nickname")} />}
                        {opera && (
                            <>
                                <InputField label="Номер акта" val={form.operaAct} set={upd("operaAct")} />
                                <InputField label="Номер сцены" val={form.operaScene} set={upd("operaScene")} />
                            </>
                        )}
                        <InputField label="Версия/Подзаголовок" val={form.version} set={upd("version")} />

                        <Preview text={preview} />

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
                        <InputField label="Композитор" req val={form.composer} set={upd("composer")} />
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

                        <div className="actions"><button className="btn" onClick={() => setOpen(false)}>Закрыть</button></div>
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

const Preview = ({ text }) => (
    <div className="preview"><div className="preview-label">Полный предварительный просмотр</div><div className="preview-text">{text || "—"}</div></div>
);
