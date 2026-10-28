// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// import { useSearchDebounce } from "../hooks/use-search-debounce";
// // import { useSearchOrchestrator } from "../orchestrator/use-search-orchestrator";

// export default function SearchInput() {
//   const [value, setValue] = useState("");
//   const router = useRouter();

//   // const orchestrator = useSearchOrchestrator();

//   const handleSubmit = async () => {
//     if (!value) return;

//     // const result = await orchestrator.mutateAsync(value);

//     if (result.type === "search") {
//       // search results handled in dropdown (optional state)
//       return;
//     }

//     if (result.type === "import") {
//       router.push(`/search/result/${result.jobId}`);
//     }
//   };

//   return (
//     <div className="relative w-full">
//       <input
//         value={value}
//         onChange={(e) => setValue(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") handleSubmit();
//         }}
//         placeholder="Search or paste URL..."
//         className="w-full border p-2 rounded"
//       />

//       {orchestrator.isPending && (
//         <div className="text-xs text-gray-500 mt-1">Processing...</div>
//       )}
//     </div>
//   );
// }
