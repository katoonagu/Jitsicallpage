export default function Alert() {
  return (
    <div className="relative size-full" data-name="Alert">
      <div className="absolute bg-[#f8ae1a] h-[64px] left-0 rounded-[7px] top-0 w-[300px]" />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[15px] not-italic text-[13px] text-black top-[32px] w-[274px]">
        <p className="leading-[normal] whitespace-pre-wrap">You need to enable microphone and camera access to join the meeting</p>
      </div>
    </div>
  );
}