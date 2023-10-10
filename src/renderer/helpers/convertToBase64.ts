export default function convertToBase64(
  file: File,
  onSuccess?: (param: string | ArrayBuffer | null) => void,
  onError?: (param: unknown) => void
) {
  const fileReader = new FileReader();

  fileReader.readAsDataURL(file);
  fileReader.onload = () => onSuccess?.(fileReader.result);
  fileReader.onerror = (error) => onError?.(error);
}
