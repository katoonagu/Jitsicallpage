import svgPaths from "./svg-qwfgtugzxt";
import img8X8LogoPng from "figma:asset/a72d808de1a86028867072f0c54f388b92ac4e7c.png";
import imgAppStoreBadgePng from "figma:asset/9a42e8d73dc4dbf02e9165f397ff8da90dbae75a.png";
import imgGooglePlayBadgePng from "figma:asset/98a2733682df8e6969743c7caafc1c6a4d21ff14.png";
import imgFDroidBadgePng from "figma:asset/022af21d9561b6af820311ec6b3f1aafc7658217.png";
import imgSlackPng from "figma:asset/041fcaa2783dbf36ffa6b0001995e5149ba0f052.png";
import imgFbPng from "figma:asset/73dc131b9b4fe0e0635a9fa869b9336f6869c64b.png";
import imgLiPng from "figma:asset/02213affcd0013361a35e78c26720927cc9ae9e8.png";
import imgTwPng from "figma:asset/6770beca3b14a1f2999f2ecbafdf9fa480d9dbdd.png";
import imgGhPng from "figma:asset/fd5823994372c13bc9a9453daddfbb272ceecb31.png";

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
    <div className="content-stretch flex flex-col items-start pt-[30px] relative shrink-0" data-name="Heading 1:margin">
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
    <div className="content-stretch flex flex-col items-start pb-[32px] pt-[16px] relative shrink-0" data-name="Margin">
      <Container1 />
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

function Container2() {
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

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Svg />
    </div>
  );
}

function ButtonOpenSettings() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[24px]" data-name="Button - Open settings">
      <Container3 />
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

function Container6() {
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
          <Container6 />
        </div>
      </div>
    </div>
  );
}

function Margin1() {
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

function Container5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative rounded-[4px]" data-name="Container">
      <Margin1 />
      <ButtonStartMeeting />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex items-center justify-center max-w-[480px] relative shrink-0 w-full" data-name="Container">
      <Container5 />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[688px] relative shrink-0 w-full" data-name="Container">
      <Heading1Margin />
      <Margin />
      <Container2 />
      <Overlay />
      <Container4 />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#2e2e2e] h-[532px] relative shrink-0 w-full" data-name="Background">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pb-[148px] pt-[120px] px-[16px] relative size-full">
          <Container />
        </div>
      </div>
    </div>
  );
}

function Component8X8LogoPng() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="8x8-logo.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={img8X8LogoPng} />
      </div>
    </div>
  );
}

function ImgMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[16px] relative shrink-0" data-name="Img:margin">
      <Component8X8LogoPng />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-[120.05000305175781px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[32px]">Jitsi as a Service</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex items-center left-[32px] right-[32px] top-[32px]" data-name="Container">
      <ImgMargin />
      <Container11 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[94px]" data-name="Heading 3">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-white whitespace-nowrap">
        <p className="leading-[36px] mb-0">Want meetings in your</p>
        <p className="mb-0">
          <span className="leading-[36px]">{`app? Check out `}</span>
          <span className="font-['Arial:Bold',sans-serif] leading-[36px] not-italic">Jitsi as a</span>
        </p>
        <p>
          <span className="font-['Arial:Bold',sans-serif] leading-[36px] not-italic">Service</span>
          <span className="leading-[36px]">.</span>
        </p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[218px]" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="mb-0">Connect the users of your website or</p>
        <p className="mb-0">{`app. Get branding & tight access`}</p>
        <p className="mb-0">controls. Have notifications,</p>
        <p className="mb-0">{`transcriptions & recordings delivered`}</p>
        <p>straight to your backend</p>
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-white content-stretch flex items-start pb-[15.14px] pt-[14px] px-[16px] relative rounded-[3px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Arial:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#36373a] text-[12px] text-left whitespace-nowrap" role="link" tabIndex="0">
        <p className="cursor-pointer leading-[17.14px]">Learn more</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <a className="content-stretch cursor-pointer flex items-start relative shrink-0" data-name="Link" href="https://jaas.8x8.vc/">
      <Background2 />
    </a>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[362px]" data-name="Container">
      <Link />
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[441.14px] relative shrink-0 w-full" data-name="Container">
      <Container10 />
      <Heading1 />
      <Container12 />
      <Container13 />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#444447] content-stretch flex flex-col items-start relative rounded-[8px] shrink-0 w-full" data-name="Background">
      <Container9 />
    </div>
  );
}

function Container8() {
  return (
    <div className="max-w-[718px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start max-w-[inherit] px-[15px] relative w-full">
        <Background1 />
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 right-[16px] top-[39.07px]" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[17.14px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="mb-0">Jitsi on mobile – download our apps and start a meeting from</p>
        <p>anywhere</p>
      </div>
    </div>
  );
}

function AppStoreBadgePng() {
  return (
    <div className="h-[40px] relative shrink-0 w-[120px]" data-name="app-store-badge.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgAppStoreBadgePng} />
      </div>
    </div>
  );
}

function Link1() {
  return (
    <a className="absolute content-stretch cursor-pointer flex items-start left-0 pb-[3px] top-[103.28px]" data-name="Link" href="https://apps.apple.com/us/app/jitsi-meet/id1165103905">
      <AppStoreBadgePng />
    </a>
  );
}

function GooglePlayBadgePng() {
  return (
    <div className="h-[45px] relative shrink-0 w-[153px]" data-name="google-play-badge.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgGooglePlayBadgePng} />
      </div>
    </div>
  );
}

function Link2() {
  return (
    <a className="absolute content-stretch cursor-pointer flex items-start left-[123.34px] pb-[3px] top-[98.28px]" data-name="Link" href="https://play.google.com/store/apps/details">
      <GooglePlayBadgePng />
    </a>
  );
}

function FDroidBadgePng() {
  return (
    <div className="h-[40px] relative shrink-0 w-[135px]" data-name="f-droid-badge.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFDroidBadgePng} />
      </div>
    </div>
  );
}

function Link3() {
  return (
    <a className="absolute content-stretch cursor-pointer flex items-start left-0 pb-[3px] top-[148.42px]" data-name="Link" href="https://f-droid.org/en/packages/org.jitsi.meet/">
      <FDroidBadgePng />
    </a>
  );
}

function HorizontalBorder() {
  return (
    <div className="h-[213.42px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#424447] border-b border-solid inset-0 pointer-events-none" />
      <Container15 />
      <Link1 />
      <Link2 />
      <Link3 />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[316px]" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[17.14px] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="mb-0">Hello, Slack fans! Very pleased to meet you! Just add our</p>
        <p>extension and off you go!</p>
      </div>
    </div>
  );
}

function SlackPng() {
  return (
    <div className="h-[40px] relative shrink-0 w-[156px]" data-name="slack.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgSlackPng} />
      </div>
    </div>
  );
}

function Link4() {
  return (
    <a className="content-stretch cursor-pointer flex items-start pb-[3px] relative shrink-0" data-name="Link" href="https://slack.com/oauth/authorize">
      <SlackPng />
    </a>
  );
}

function HorizontalBorder1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start pb-[30px] pt-[31.07px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#424447] border-b border-solid inset-0 pointer-events-none" />
      <Container16 />
      <Link4 />
    </div>
  );
}

function Link5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Arial:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap" href="https://jitsi.org/meet-jit-si-privacy/">
        <p className="cursor-pointer leading-[16px]">Privacy Policy</p>
      </a>
    </div>
  );
}

function Link6() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Arial:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap" href="http://jitsi.org/meet-jit-si-terms-of-service/">
        <p className="cursor-pointer leading-[16px]">{`Terms & Conditions`}</p>
      </a>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex gap-[19.34px] items-start pb-[24px] relative shrink-0 w-full" data-name="Container">
      <Link5 />
      <Link6 />
    </div>
  );
}

function FbPng() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="fb.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFbPng} />
      </div>
    </div>
  );
}

function Link7() {
  return (
    <a className="bg-[#36383c] content-stretch flex items-start p-[16px] relative shrink-0" data-name="Link" href="https://www.facebook.com/jitsi">
      <FbPng />
    </a>
  );
}

function LiPng() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="li.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgLiPng} />
      </div>
    </div>
  );
}

function Link8() {
  return (
    <a className="bg-[#36383c] content-stretch flex items-start p-[16px] relative shrink-0" data-name="Link" href="https://www.linkedin.com/company/8x8/">
      <LiPng />
    </a>
  );
}

function TwPng() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="tw.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgTwPng} />
      </div>
    </div>
  );
}

function Link9() {
  return (
    <a className="bg-[#36383c] content-stretch flex items-start p-[16px] relative shrink-0" data-name="Link" href="https://twitter.com/jitsinews">
      <TwPng />
    </a>
  );
}

function GhPng() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="gh.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgGhPng} />
      </div>
    </div>
  );
}

function Link10() {
  return (
    <a className="bg-[#36383c] content-stretch flex items-start p-[16px] relative shrink-0" data-name="Link" href="https://github.com/jitsi">
      <GhPng />
    </a>
  );
}

function Container18() {
  return (
    <div className="content-stretch cursor-pointer flex gap-[15.3px] items-start relative shrink-0 w-full" data-name="Container">
      <Link7 />
      <Link8 />
      <Link9 />
      <Link10 />
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[21px] pt-[20px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#424447] border-b border-solid inset-0 pointer-events-none" />
      <Container17 />
      <Container18 />
    </div>
  );
}

function Component8X8LogoPng1() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="8x8-logo.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={img8X8LogoPng} />
      </div>
    </div>
  );
}

function Link11() {
  return (
    <a className="content-stretch cursor-pointer flex flex-col items-start pr-[32px] relative shrink-0" data-name="Link" href="https://8x8.com/">
      <Component8X8LogoPng1 />
    </a>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#a1a1a3] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">8x8 is a proud supporter of the Jitsi community.</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#a1a1a3] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">© 8x8, Inc. All Rights Reserved.</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-[250.55999755859375px] relative shrink-0" data-name="Container">
      <Container21 />
      <Container22 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center pb-[56px] pt-[32px] relative shrink-0 w-full" data-name="Container">
      <Link11 />
      <Container20 />
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[16px] relative w-full">
        <HorizontalBorder />
        <HorizontalBorder1 />
        <HorizontalBorder2 />
        <Container19 />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="bg-[#131519] content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Footer">
      <Container14 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full" data-name="Container">
      <Container8 />
      <Footer />
    </div>
  );
}

function Main() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[24px] items-start left-0 min-h-[780px] right-[10px] top-0" data-name="Main">
      <Background />
      <Container7 />
    </div>
  );
}

export default function Component390WDefault() {
  return (
    <div className="relative size-full" data-name="390w default">
      <Main />
    </div>
  );
}