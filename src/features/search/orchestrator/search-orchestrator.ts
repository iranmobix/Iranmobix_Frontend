// import { resolveIntent } from "./input-resolver";
// import {
//   searchAction,
//   importUrlAction,
//   importImageAction,
// } from "./actions";

// export async function searchOrchestrator(input: string) {
//   const intent = resolveIntent(input);

//   switch (intent) {
//     case "SEARCH": {
//       const data = await searchAction(input);

//       return {
//         state: "SEARCH_RESULT",
//         data,
//       };
//     }

//     case "IMPORT_URL": {
//       const job = await importUrlAction(input);

//       return {
//         state: "IMPORT_STARTED",
//         jobId: job.job_id,
//       };
//     }

//    case "IMPORT_IMAGE": {
//   throw new Error("Image import not supported yet");
// }

//     default:
//   return {
//     state: "SEARCH_RESULT",
//     data: [],
//   };
//   }
// }
