import { useEffect } from 'react';

const getReport = async () => {
  const res = await window.report.getReport();

  console.log(res);
};

export default function Report() {
  useEffect(() => {
    getReport();
  }, []);

  return (
    <>
      <div className="w-full h-full flex">
        Reports
      </div>
    </>
  );
}
