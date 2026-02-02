import svgPaths from "./svg-is291j2rix";
import imgOverlayBackground from "figma:asset/455efd74484e4206bfe7dee2d881fb68f6a253a3.png";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center min-w-[177.3800048828125px] relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[42px] text-center text-white whitespace-nowrap">
        <p className="leading-[50px]">Jitsi Meet</p>
      </div>
    </div>
  );
}

function Heading1Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[255.31px] pt-[30px] top-0" data-name="Heading 1:margin">
      <Heading />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Arial:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-center text-white whitespace-nowrap">
        <p className="leading-[26px]">Secure and high quality meetings</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[184.52px] pb-[32px] pt-[16px] top-[80px]" data-name="Margin">
      <Container1 />
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Arial:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f1f1f1] text-[12px] text-center whitespace-nowrap" href="https://moderated.jitsi.net/">
        <p className="cursor-pointer leading-[17.14px]">book a meeting URL</p>
      </a>
    </div>
  );
}

function Container2() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex items-start justify-center left-1/2 max-w-[648px] pb-[0.14px] pt-[15px] top-[212px] w-[648px]" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f1f1f1] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[17.14px]">{`Or `}</p>
      </div>
      <Link />
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f1f1f1] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[17.14px]">{` in advance where you are the only moderator.`}</p>
      </div>
    </div>
  );
}

function WatermarkSvg() {
  return (
    <div className="h-[32px] relative shrink-0 w-[71px]" data-name="watermark.svg">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 71 32">
        <g clipPath="url(#clip0_1_107)" id="watermark.svg">
          <path d={svgPaths.p187d5d00} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p373a8600} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p1981b00} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p1c73ca00} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p883c300} fill="var(--fill-0, white)" id="Vector_5" />
          <path d={svgPaths.p30fb000} fill="var(--fill-0, white)" id="Vector_6" />
        </g>
        <defs>
          <clipPath id="clip0_1_107">
            <rect fill="white" height="32" width="71" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function WatermarkSvgFill() {
  return (
    <div className="content-stretch flex flex-col h-[32px] items-start justify-center overflow-clip relative shrink-0 w-[71px]" data-name="watermark.svg fill">
      <WatermarkSvg />
    </div>
  );
}

function Image() {
  return (
    <div className="content-stretch flex flex-col h-[32px] items-start max-h-[70px] max-w-[140px] relative shrink-0 w-[71px]" data-name="Image">
      <WatermarkSvgFill />
    </div>
  );
}

function LinkJitsiMeetLogoLinksToHomepage() {
  return (
    <a className="absolute content-stretch cursor-pointer flex flex-col h-[32px] items-start left-0 max-h-[70px] max-w-[140px] top-0 w-[71px]" data-name="Link - Jitsi Meet Logo, links to  Homepage" href="https://jitsi.org/">
      <Image />
    </a>
  );
}

function Container3() {
  return (
    <div className="absolute inset-[-84px_0_84px_0]" data-name="Container">
      <LinkJitsiMeetLogoLinksToHomepage />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.pe3b500} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.pee08300} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Svg />
    </div>
  );
}

function ButtonOpenSettings() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[24px]" data-name="Button - Open settings">
      <Container4 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.38)] content-stretch flex flex-col items-start p-[4px] right-0 rounded-[3px] top-[-69px]" data-name="Overlay">
      <ButtonOpenSettings />
    </div>
  );
}

function Container7() {
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
          <Container7 />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch" data-name="Container">
      <div className="content-stretch flex flex-col items-start pr-[4px] relative size-full">
        <FormInputMeetingNameInput />
      </div>
    </div>
  );
}

function ButtonStartMeeting() {
  return (
    <div className="bg-[#0977e2] content-stretch flex flex-col items-center justify-center min-w-[123.2699966430664px] px-[20px] py-[17px] relative rounded-[3px] shrink-0" data-name="Button - Start meeting">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[normal]">Start meeting</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[4px]" data-name="Background">
      <div className="content-stretch flex items-start p-[4px] relative w-full">
        <Container6 />
        <ButtonStartMeeting />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex items-center justify-center left-1/2 max-w-[480px] top-[154px] w-[480px]" data-name="Container">
      <Background />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[245.14px] max-w-[688px] relative shrink-0 w-full" data-name="Container">
      <Heading1Margin />
      <Margin />
      <Container2 />
      <Container3 />
      <Overlay />
      <Container5 />
    </div>
  );
}

export default function OverlayBackground() {
  return (
    <div className="bg-size-[auto_auto,auto_auto,1280px_613px] bg-top-left content-stretch flex flex-col items-start pb-[16px] pt-[120px] px-[40px] relative size-full" data-name="Overlay+Background" style={{ backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 75.16%), url('${imgOverlayBackground}')` }}>
      <Container />
    </div>
  );
}