import { useState, useMemo } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const YEARS = Array.from({ length: 126 }, (_, i) => 2025 - i);
const KEYS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];
const GENRES = ["Classical", "Romantic", "Baroque", "Contemporary", "Early Music"];
const SUBGENRES = [
    "Classical - Solo Piano",
    "Classical - Symphony",
    "Classical - Concerto",
    "Classical - Chamber Music",
    "Classical - Opera",
    "Classical - Choral",
    "Classical - Solo Instrument"
];
const LANGUAGES = [
    "Russian",
    "English",
    "German",
    "Italian",
    "French",
    "Latin",
    "Spanish",
    "zxx"
];
const INSTRUMENTS = [
    "Piano",
    "Violin",
    "Cello",
    "Flute",
    "Oboe",
    "Clarinet",
    "Trumpet",
    "Guitar",
    "Organ",
    "Voice"
];
const PRICES = ["Frontline", "Mid-price", "Budget"];

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
    const update = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

    const cls = form.mainType === "classical";
    const opera = form.addType === "opera";
    const part = !form.whole;
    const subtype = cls && part && !opera;
    const keyBlock = cls && form.keySpecified && !opera;
    const vocal = !form.instrumental;

    const preview = useMemo(() => {
        if (opera) {
            const o = form.operaTitle || "";
            const sn = form.operaScene ? ` Scene ${form.operaScene}` : "";
            const an = form.operaAct ? ` Act ${form.operaAct}` : "";
            const ex = form.operaExcerpt ? ` — ${form.operaExcerpt}` : "";
            const v = form.version ? ` (${form.version})` : "";
            return `${o}${an}${sn}${ex}${v}`.trim();
        }
        const work = form.workTitle || "";
        const partNo = form.partNumber ? ` No.${form.partNumber}` : "";
        const partTitle = form.partTitle ? ` ${form.partTitle}` : "";
        const key = keyBlock && form.key ? ` in ${form.key}${form.acc === "sharp" ? "#" : form.acc === "flat" ? "♭" : ""} ${form.mode === "minor" ? "Minor" : "Major"}` : "";
        const opus = form.opus ? `, Op. ${form.opus}` : "";
        const cat = form.catalog ? `, ${form.catalog}` : "";
        const nick = form.nickname ? ` \"${form.nickname}\"` : "";
        const ver = form.version ? ` (${form.version})` : "";
        return `${work}${partNo}${partTitle}${key}${opus}${cat}${nick}${ver}`.trim();
    }, [form, keyBlock, opera]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Track metadata</Button>
            </DialogTrigger>
            <DialogContent className="max-h-screen overflow-y-auto w-[48rem]">
                <DialogHeader>
                    <DialogTitle>Метаданные трека</DialogTitle>
                </DialogHeader>

                <Field label="Тип контента" req>
                    <RG val={form.contentType} set={update("contentType")} opts={{ audio: "Аудио", video: "Видео" }} />
                </Field>
                <Field label="Основной тип композиции" req>
                    <RG val={form.mainType} set={(v) => {
                        if (v !== "classical") setForm((p) => ({ ...p, mainType: v, addType: "none" }));
                        else update("mainType")(v);
                    }} opts={{ music: "Музыка", classical: "Классическая музыка" }} />
                </Field>
                {cls && (
                    <Field label="Дополнительный тип композиции" req>
                        <RG val={form.addType} set={update("addType")} opts={{ opera: "Опера", other: "Другая классическая музыка" }} />
                    </Field>
                )}
                {cls && (
                    <Field label="Данная композиция – это" req>
                        <RG val={form.whole ? "whole" : "part"} set={(v) => update("whole")(v === "whole")} opts={{ whole: "произведение целиком", part: "часть произведения" }} />
                    </Field>
                )}
                {subtype && (
                    <Field label="Данное произведение – это" req>
                        <RG val={form.subType} set={update("subType")} opts={{ A: "A - Симфония...", B: "B - Этюд...", C: "C - Месса/Балет..." }} />
                    </Field>
                )}
                <Field label="Инструментальная">
                    <RG val={form.instrumental ? "yes" : "no"} set={(v) => update("instrumental")(v === "yes")} opts={{ yes: "Да", no: "Нет" }} />
                </Field>

                {!opera && (
                    <InputField label="Название произведения" req value={form.workTitle} set={update("workTitle")} />
                )}
                {opera && (
                    <InputField label="Название оперы" req value={form.operaTitle} set={update("operaTitle")} />
                )}

                {opera && (
                    <InputField label="Название отрывка" value={form.operaExcerpt} set={update("operaExcerpt")} />
                )}

                {part && !opera && (
                    <>
                        <InputField label="Номер части" value={form.partNumber} set={update("partNumber")} />
                        <InputField label="Название части" value={form.partTitle} set={update("partTitle")} />
                    </>
                )}

                {keyBlock && (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <input id="nokey" type="checkbox" checked={!form.keySpecified} onChange={(e) => update("keySpecified")(!e.target.checked)} />
                            <Label htmlFor="nokey">Тональность не указана</Label>
                        </div>
                        {form.keySpecified && (
                            <>
                                <Field label="Тональность" req>
                                    <Sel val={form.key} set={update("key")} ph="- Пожалуйста, выберите -" arr={KEYS} />
                                </Field>
                                <Field>
                                    <RG val={form.acc || "nat"} set={update("acc")} opts={{ sharp: "#", flat: "♭", nat: "♮" }} />
                                </Field>
                                <Field>
                                    <RG val={form.mode || "major"} set={update("mode")} opts={{ minor: "Минор", major: "Мажор" }} />
                                </Field>
                            </>
                        )}
                    </>
                )}

                {!opera && <InputField label="Номер опуса" value={form.opus} set={update("opus")} />}
                {!opera && <InputField label="Номер в каталоге" value={form.catalog} set={update("catalog")} />}
                {!opera && <InputField label="Псевдоним" value={form.nickname} set={update("nickname")} />}

                {opera && (
                    <>
                        <InputField label="Номер акта" value={form.operaAct} set={update("operaAct")} />
                        <InputField label="Номер сцены" value={form.operaScene} set={update("operaScene")} />
                    </>
                )}

                <InputField label="Версия/Подзаголовок" value={form.version} set={update("version")} />

                <Preview text={preview} />

                <InputField label="Оркестр или хор" value={form.orchestra} set={update("orchestra")} />
                <InputField label="Дирижер" value={form.conductor} set={update("conductor")} />
                <InputField label="Солист" value={form.soloist} set={update("soloist")} />
                <Field label="Инструмент солиста">
                    <Sel val={form.soloInstrument} set={update("soloInstrument")} ph="Please select an instrument" arr={INSTRUMENTS} />
                </Field>
                {vocal && (
                    <>
                        <InputField label="Певец" value={form.singer} set={update("singer")} />
                        <Field label="Инструмент певца">
                            <Sel val={form.singerInstrument} set={update("singerInstrument")} ph="Please select an instrument" arr={INSTRUMENTS} />
                        </Field>
                    </>
                )}
                <InputField label="Приглашенный исполнитель" value={form.featured} set={update("featured")} />
                <InputField label="Автор ремикса" value={form.remixer} set={update("remixer")} />
                <InputField label="Автор" value={form.author} set={update("author")} />
                <InputField label="Композитор" req value={form.composer} set={update("composer")} />
                <InputField label="Аранжировщик" value={form.arranger} set={update("arranger")} />

                <InputField label="℗ PLine" req value={form.pline} set={update("pline")} />
                <Field label="Год записи" req>
                    <Sel val={form.year} set={update("year")} ph="- Выберите год -" arr={YEARS} />
                </Field>
                <InputField label="Издатель" value={form.publisher} set={update("publisher")} />
                <InputField label="ISRC" value={form.isrc} set={update("isrc")} />
                <Field label="Попросить присвоить ISRC">
                    <RG val={form.autoIsrc ? "yes" : "no"} set={(v) => update("autoIsrc")(v === "yes")} opts={{ yes: "Да", no: "Нет" }} />
                </Field>

                <Field label="Жанр" req>
                    <Sel val={form.genre} set={update("genre")} ph="Classical" arr={GENRES} />
                </Field>
                <Field label="Поджанр" req>
                    <Sel val={form.subGenre} set={update("subGenre")} ph="- Выберите жанр -" arr={SUBGENRES} />
                </Field>
                <Field label="Дополнительный жанр">
                    <Sel val={form.extraGenre} set={update("extraGenre")} ph="- Выберите жанр -" arr={SUBGENRES} />
                </Field>
                <Field label="Уровень цен" req>
                    <Sel val={form.price} set={update("price")} ph="-" arr={PRICES} />
                </Field>
                <InputField label="Номер в каталоге" value={form.labelCatalog} set={update("labelCatalog")} />

                <Field label="Присутствие ненормативной лексики" req>
                    <RG val={form.explicit || "no"} set={update("explicit")} opts={{ yes: "Да", no: "Нет", clean: "Чистая версия" }} />
                </Field>
                <InputField label="Начало превью / фрагмента" value={form.previewStart} set={update("previewStart")} def="120.000" />

                <Field label="Язык названия композиции" req>
                    <Sel val={form.titleLang} set={update("titleLang")} ph="Please select..." arr={LANGUAGES} />
                </Field>
                {vocal && (
                    <>
                        <Field label="Язык слов песни" req>
                            <Sel val={form.lyricsLang} set={update("lyricsLang")} ph="Please select..." arr={LANGUAGES} />
                        </Field>
                        <Field label="Текст песни">
                            <Textarea value={form.lyrics} onChange={(e) => update("lyrics")(e.target.value)} rows={3} />
                        </Field>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

const Field = ({ label, children, req }) => (
    <div className="mb-4">
        <Label className="block mb-1">
            {label} {req && <span className="text-destructive">*</span>}
        </Label>
        {children}
    </div>
);

const InputField = ({ label, req, value, set, def = "" }) => (
    <Field label={label} req={req}>
        <Input value={value ?? def} onChange={(e) => set && set(e.target.value)} />
    </Field>
);

const RG = ({ val, set, opts }) => (
    <RadioGroup value={val} onValueChange={set} className="flex flex-wrap gap-4">
        {Object.entries(opts).map(([v, l]) => (
            <label key={v} className="flex items-center gap-1 cursor-pointer">
                <RadioGroupItem value={v} /> {l}
            </label>
        ))}
    </RadioGroup>
);

const Sel = ({ val, set, ph, arr }) => (
    <Select value={val ?? ""} onValueChange={set}>
        <SelectTrigger className="w-full">
            <SelectValue placeholder={ph} />
        </SelectTrigger>
        <SelectContent>
            {arr.map((i) => (
                <SelectItem key={i} value={String(i)}>
                    {i}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);

const Preview = ({ text }) => (
    <div className="mb-6 text-sm bg-gray-100 p-3 rounded">
        <Label className="block mb-1">Полный предварительный просмотр</Label>
        <div>{text}</div>
    </div>
);
