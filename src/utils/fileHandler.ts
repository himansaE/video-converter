import { getHash } from "./utils";

export interface FileHandler {
  file: File;
  thumbnail?: string;
  id: number;
  length?: number;
  in_progress: boolean;
  progress?: number;
  is_data_loaded: boolean;
  data_url?: string;
  fileInfo?: string;
  metadataState: MetadataLoadState;
  metadata?: readonly any[];
  activeTab: number;
  type: FileType;
}
export enum FileType {
  inDevice,
  downloaded,
}
export enum MetadataLoadState {
  true,
  loading,
  false,
}

export function createFileHandler(f: {
  file: File;
  thumbnail?: string;
  in_progress?: boolean;
  type?: FileType;
}): FileHandler {
  return {
    file: f.file,
    thumbnail: f.thumbnail,
    id: getHash(f.file.name),
    in_progress: f.in_progress ?? false,
    is_data_loaded: false,
    metadataState: MetadataLoadState.false,
    activeTab: 0,
    type: f.type ?? FileType.inDevice,
  };
}
