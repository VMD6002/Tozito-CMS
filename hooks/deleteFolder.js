import { storage } from "@/Firebase/firebase";
import { deleteObject, listAll, ref } from "firebase/storage";

export default async function deleteFolder(folderPath) {
  const folderRef = ref(storage, folderPath);
  const { items, prefixes } = await listAll(folderRef);

  // Delete all files in the folder
  items.forEach(async (item) => {
    await deleteObject(item);
  });

  // Recursively delete subfolders
  prefixes.forEach(async (subfolder) => {
    await deleteFolder(subfolder.fullPath);
  });
}
