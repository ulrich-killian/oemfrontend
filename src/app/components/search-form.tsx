export function SearchForm({ defaultValue = '' }: { defaultValue?: string }) {
   return (
     <form action="/search" className="mt-6 flex gap-2">
       <input
         name="q"
         defaultValue={defaultValue}
         placeholder="Search by OEM number, e.g. BP-123"
         aria-label="OEM number"
         maxLength={60}
         className="flex-1 rounded border p-3"
       />
       <button className="rounded bg-black px-4 py-3 text-white">Search</button>
     </form>
   );
 }