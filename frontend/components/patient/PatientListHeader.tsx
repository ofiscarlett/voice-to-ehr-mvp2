export default function PatientListHeader() {
  return (
    <div className="grid grid-cols-3 bg-black text-white px-[30px] py-4 items-center">
      <div className="text-base font-semibold">Patient name</div>
      <div className="text-base font-semibold text-center">Identity Number</div>
      {/* Empty div for alignment with controls */}
      <div></div> 
    </div>
  );
} 