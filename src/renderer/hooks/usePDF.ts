import useAlert from "./useAlert";
import useErrorHandler from "./useErrorHandler";

export default function usePDF () {
  const { displayAlert } = useAlert();
  const errorHandler = useErrorHandler();

  const downloadPDF = async (
    fileName: string,
    htmlString: string
  ) => {
    const res = await window.pdf.download(fileName, htmlString);

    if (res.status === 'ERROR') {
      return errorHandler({
        errors: res.errors
      });
    }

    displayAlert?.('Successfully downloaded PDF to Documents folder', 'success');
  }

  return {
    downloadPDF
  }
}
