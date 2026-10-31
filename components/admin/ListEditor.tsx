import { deleteListRow, saveListRow, type ListName } from "@/app/admin/actions";
import { ImageField } from "./ImageField";
import { VideoField } from "./VideoField";
import { btn, card, input, label } from "./styles";

export type Field = { name: string; label: string; type?: "text" | "number" | "date" | "url" | "textarea" | "select" | "image" | "video"; noAlt?: boolean; options?: string[]; required?: boolean; wide?: boolean };

function Inputs({ fields, row }: { fields: Field[]; row?: Record<string, unknown> }) {
  return (
    <>
      {fields.map((f) => {
        const v = row?.[f.name] == null ? "" : String(row[f.name]);
        const id = `${f.name}-${row?.id ?? "new"}`;
        if (f.type === "video")
          return (
            <div key={f.name} className="md:col-span-2">
              <VideoField name={f.name} label={f.label} defaultPath={v || null} />
            </div>
          );
        if (f.type === "image")
          return (
            <div key={f.name} className="md:col-span-2">
              <ImageField name={f.name} altName={f.noAlt ? undefined : f.name.replace("_path", "_alt")} label={f.label} defaultPath={v || null} defaultAlt={String(row?.[f.name.replace("_path", "_alt")] ?? "")} />
            </div>
          );
        return (
          <div key={f.name} className={f.wide || f.type === "textarea" ? "md:col-span-2" : ""}>
            <label htmlFor={id} className={label}>{f.label}{f.required && " *"}</label>
            {f.type === "textarea" ? (
              <textarea id={id} name={f.name} defaultValue={v} rows={3} required={f.required} className={input} />
            ) : f.type === "select" ? (
              <select id={id} name={f.name} defaultValue={v} className={input}>
                {f.options!.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
              </select>
            ) : (
              <input id={id} name={f.name} type={f.type ?? "text"} defaultValue={v} required={f.required} className={input} />
            )}
          </div>
        );
      })}
    </>
  );
}

/** Server-rendered CRUD list for small tables (projects, timeline, testimonials). */
export function ListEditor({ list, title, fields, rows }: { list: ListName; title: string; fields: Field[]; rows: Record<string, unknown>[] }) {
  const save = saveListRow.bind(null, list);
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{title}</h1>
      <form action={save} className={`${card} grid gap-4 md:grid-cols-2`}>
        <p className="font-medium md:col-span-2">Add new</p>
        <Inputs fields={fields} />
        <div className="md:col-span-2"><button className={btn}>Add</button></div>
      </form>
      <ul className="space-y-4">
        {rows.map((row) => (
          <li key={String(row.id)} className={card}>
            <form action={save} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={String(row.id)} />
              <Inputs fields={fields} row={row} />
              <div className="flex gap-3 md:col-span-2">
                <button className={btn}>Save</button>
                <button formAction={deleteListRow.bind(null, list, String(row.id))} className="text-sm text-white/50 hover:text-danger">Delete</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
