import { useMutation } from "@tanstack/react-query";
import { importerService } from "../services/importer.service";

export function useImportProduct() {
  return useMutation({
    mutationFn: importerService.importProduct,
  });
}