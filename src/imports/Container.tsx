function Container1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#253858] text-[14px] w-full">
        <p className="leading-[normal] whitespace-pre-wrap">BlankFantasiesEncompassAnyway</p>
      </div>
    </div>
  );
}

function FormInputMeetingNameInput() {
  return (
    <div className="bg-white h-[50px] relative rounded-[4px] shrink-0 w-full" data-name="Form → Input - Meeting name input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pl-[10px] pr-[2px] py-[17px] relative size-full">
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[10px] relative shrink-0 w-full" data-name="Margin">
      <FormInputMeetingNameInput />
    </div>
  );
}

function ButtonStartMeeting() {
  return (
    <div className="bg-[#0074e0] relative rounded-[3px] shrink-0 w-full" data-name="Button - Start meeting">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pb-[17px] pt-[16px] px-[20px] relative w-full">
          <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
            <p className="leading-[normal]">Start meeting</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative rounded-[4px] size-full" data-name="Container">
      <Margin />
      <ButtonStartMeeting />
    </div>
  );
}