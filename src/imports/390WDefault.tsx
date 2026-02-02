import svgPaths from "./svg-q6yobn1t18";

function Blur() {
  return <div className="absolute blur-[20px] h-[780px] left-0 top-0 w-[390px]" data-name="Blur" />;
}

function Video() {
  return (
    <div className="absolute content-stretch flex flex-col h-[780px] items-start justify-center left-0 overflow-clip top-0 w-[390px]" data-name="Video">
      <div className="flex-[1_0_0] min-h-px min-w-px w-full" data-name="Rectangle" />
    </div>
  );
}

function Figure() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] h-[780px] left-0 overflow-clip shadow-[0px_0px_20px_-2px_#444] top-0 w-[390px]" data-name="Figure">
      <Video />
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
    <a className="absolute content-stretch cursor-pointer flex flex-col h-[32px] items-start left-[32px] max-h-[70px] max-w-[140px] top-[32px] w-[71px]" data-name="Link - Jitsi Meet Logo, links to  Homepage" href="https://jitsi.org/">
      <Image />
    </a>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#040404] h-[780px] left-0 overflow-clip top-0 w-[390px]" data-name="Background">
      <Blur />
      <Figure />
      <LinkJitsiMeetLogoLinksToHomepage />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="Container">
      <Background />
    </div>
  );
}

function Svg() {
  return (
    <div className="absolute bottom-0 left-1/4 right-1/4 top-0" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p37acea00} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[100px] relative shrink-0 w-full" data-name="Container">
      <Svg />
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#aaa] content-stretch flex flex-col items-start overflow-clip py-[50px] relative rounded-[100px] shrink-0 size-[200px]" data-name="Background">
      <Container2 />
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#040404] content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative w-full" data-name="Background">
      <Background3 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex items-start justify-center max-w-[258px] overflow-clip relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Arial:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-center text-white whitespace-nowrap">
        <p className="leading-[28px]">124 F 334 G 43 Ghh</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <Container7 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[24px] relative shrink-0 w-full" data-name="Margin">
      <Container6 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#c2c2c2] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[normal]">Enter your name</p>
      </div>
    </div>
  );
}

function InputEnterYourName() {
  return (
    <div className="bg-[#3d3d3d] h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Input - Enter your name">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[16px] py-[12px] relative size-full">
          <Container9 />
        </div>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p12a59980} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg1 />
    </div>
  );
}

function ButtonMenuJoinWithoutAudio() {
  return (
    <div className="absolute bottom-0 content-stretch flex items-center justify-center right-0 rounded-[3px] top-0 w-[36px]" data-name="Button menu - Join without audio">
      <Container10 />
    </div>
  );
}

function ButtonJoinMeeting() {
  return (
    <div className="bg-[#4687ed] relative rounded-[6px] shrink-0 w-full" data-name="Button - Join meeting">
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex items-start justify-center px-[16px] py-[11px] relative w-full">
          <div className="flex flex-col font-['Arial:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
            <p className="leading-[24px]">Join meeting</p>
          </div>
          <ButtonMenuJoinWithoutAudio />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start pb-[8px] relative shrink-0 w-full" data-name="Container">
      <InputEnterYourName />
      <ButtonJoinMeeting />
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center px-[50px] relative w-full">
          <Margin />
          <Container8 />
        </div>
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p1d6f6100} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path d={svgPaths.p2bcc780} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p1528db80} fill="var(--fill-0, white)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Container15() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg2 />
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#3d3d3d] content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Background">
      <Container15 />
    </div>
  );
}

function ButtonUnmuteMicrophone() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Button - Unmute microphone">
      <Background4 />
    </div>
  );
}

function ButtonUnmuteMicrophoneMargin() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Button - Unmute microphone:margin">
      <ButtonUnmuteMicrophone />
    </div>
  );
}

function Svg3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p2fb9f180} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path d={svgPaths.p3d6cf980} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container16() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg3 />
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#3d3d3d] content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Background">
      <Container16 />
    </div>
  );
}

function ButtonStartCamera() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Button - Start camera">
      <Background5 />
    </div>
  );
}

function ButtonStartCameraMargin() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Button - Start camera:margin">
      <ButtonStartCamera />
    </div>
  );
}

function Svg4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p23658e80} fill="var(--fill-0, white)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.pb36eb00} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg4 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Container">
      <Container18 />
    </div>
  );
}

function ButtonInvitePeople() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Button - Invite people">
      <Container17 />
    </div>
  );
}

function ButtonInvitePeopleMargin() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Button - Invite people:margin">
      <ButtonInvitePeople />
    </div>
  );
}

function Svg5() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p373cd500} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.peac8700} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg5 />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Container">
      <Container20 />
    </div>
  );
}

function ButtonSelectBackground() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Button - Select Background">
      <Container19 />
    </div>
  );
}

function ButtonSelectBackgroundMargin() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Button - Select Background:margin">
      <ButtonSelectBackground />
    </div>
  );
}

function Svg6() {
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

function Container22() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg6 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Container">
      <Container22 />
    </div>
  );
}

function ButtonOpenSettings() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Button - Open settings">
      <Container21 />
    </div>
  );
}

function ButtonOpenSettingsMargin() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Button - Open settings:margin">
      <ButtonOpenSettings />
    </div>
  );
}

function Svg7() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p1cd36400} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg7 />
      </div>
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#cb2233] content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Background">
      <Container23 />
    </div>
  );
}

function ButtonLeaveTheMeeting() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Button - Leave the meeting">
      <Background6 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex items-start justify-between py-[8px] relative shrink-0 w-full" data-name="Container">
      <ButtonUnmuteMicrophoneMargin />
      <ButtonStartCameraMargin />
      <ButtonInvitePeopleMargin />
      <ButtonSelectBackgroundMargin />
      <ButtonOpenSettingsMargin />
      <ButtonLeaveTheMeeting />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[358px] relative rounded-[6px] shrink-0" data-name="Container">
      <Container14 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Container13 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[4px] relative shrink-0 w-full" data-name="Container">
      <Container12 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container5 />
      <Container11 />
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center p-[16px] relative w-full">
          <Container4 />
        </div>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-[#141414] content-stretch flex flex-col inset-0 items-start" data-name="Background">
      <Background2 />
      <Container3 />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[780px] relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Background1 />
    </div>
  );
}

function Main() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-name="Main">
      <Container />
    </div>
  );
}

export default function Component390WDefault() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="390w default" style={{ backgroundImage: "linear-gradient(90deg, rgb(4, 4, 4) 0%, rgb(4, 4, 4) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Main />
    </div>
  );
}