import svgPaths from "./svg-57usoqxf04";
import imgOverlayBackground from "figma:asset/455efd74484e4206bfe7dee2d881fb68f6a253a3.png";
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
    <div className="bg-[#0074e0] content-stretch flex flex-col items-center justify-center min-w-[123.2699966430664px] px-[20px] py-[17px] relative rounded-[3px] shrink-0" data-name="Button - Start meeting">
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

function OverlayBackground() {
  return (
    <div className="bg-size-[auto_auto,auto_auto,1280px_613px] bg-top-left relative shrink-0 w-full" data-name="Overlay+Background" style={{ backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 75.16%), url('${imgOverlayBackground}')` }}>
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pb-[16px] pt-[120px] px-[371px] relative w-full">
          <Container />
        </div>
      </div>
    </div>
  );
}

function Margin1() {
  return <div className="h-[16px] shrink-0 w-full" data-name="Margin" />;
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

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-[120.05000305175781px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[32px]">Jitsi as a Service</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex items-center left-[32px] right-[32px] top-[32px]" data-name="Container">
      <ImgMargin />
      <Container12 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[94px]" data-name="Heading 3">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-white whitespace-nowrap">
        <p>
          <span className="leading-[36px]">{`Want meetings in your app? Check out `}</span>
          <span className="font-['Arial:Bold',sans-serif] leading-[36px] not-italic">Jitsi as a Service</span>
          <span className="leading-[36px]">.</span>
        </p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[146px]" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="mb-0">{`Connect the users of your website or app. Get branding & tight access controls. Have`}</p>
        <p>{`notifications, transcriptions & recordings delivered straight to your backend`}</p>
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

function Link1() {
  return (
    <a className="content-stretch cursor-pointer flex items-start relative shrink-0" data-name="Link" href="https://jaas.8x8.vc/">
      <Background2 />
    </a>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[32px] right-[32px] top-[218px]" data-name="Container">
      <Link1 />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[297.14px] relative shrink-0 w-full" data-name="Container">
      <Container11 />
      <Heading1 />
      <Container13 />
      <Container14 />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#444447] content-stretch flex flex-col items-start relative rounded-[8px] shrink-0 w-full" data-name="Background">
      <Container10 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[16px] relative shrink-0 w-full" data-name="Margin">
      <Background1 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center max-w-[688px] relative shrink-0 w-[688px]" data-name="Container">
      <Margin1 />
      <Margin2 />
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 max-w-[200px] min-w-[200px] px-[4.61px] top-[-0.93px]" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[17.14px] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="mb-0">Jitsi on mobile – download our apps</p>
        <p>and start a meeting from anywhere</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="h-[34.28px] max-w-[216px] relative shrink-0 w-[216px]" data-name="Margin">
      <Container16 />
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

function Link2() {
  return (
    <a className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0" data-name="Link" href="https://apps.apple.com/us/app/jitsi-meet/id1165103905">
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

function Link3() {
  return (
    <a className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0" data-name="Link" href="https://play.google.com/store/apps/details">
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

function Link4() {
  return (
    <a className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0" data-name="Link" href="https://f-droid.org/en/packages/org.jitsi.meet/">
      <FDroidBadgePng />
    </a>
  );
}

function HorizontalBorder() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#424447] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[25px] pr-[0.03px] pt-[40px] relative w-full">
          <Margin3 />
          <Link2 />
          <Link3 />
          <Link4 />
        </div>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-[473.3900146484375px] pr-[32px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[17.14px]">Hello, Slack fans! Very pleased to meet you! Just add our extension and off you go!</p>
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

function Link5() {
  return (
    <a className="content-stretch cursor-pointer flex flex-col items-start relative shrink-0" data-name="Link" href="https://slack.com/oauth/authorize">
      <SlackPng />
    </a>
  );
}

function HorizontalBorder1() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[33px] pt-[32px] relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#424447] border-b border-solid inset-0 pointer-events-none" />
      <Margin4 />
      <Link5 />
    </div>
  );
}

function Link6() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Arial:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap" href="https://jitsi.org/meet-jit-si-privacy/">
        <p className="cursor-pointer leading-[16px]">{`Privacy Policy `}</p>
      </a>
    </div>
  );
}

function Link7() {
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
    <div className="content-stretch flex gap-[16px] items-start pr-[16px] relative shrink-0" data-name="Container">
      <Link6 />
      <Link7 />
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

function Link8() {
  return (
    <a className="content-stretch flex items-start pb-[3px] relative shrink-0" data-name="Link" href="https://www.facebook.com/jitsi">
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

function Link9() {
  return (
    <a className="content-stretch flex items-start pb-[3px] relative shrink-0" data-name="Link" href="https://www.linkedin.com/company/8x8/">
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

function Link10() {
  return (
    <a className="content-stretch flex items-start pb-[3px] relative shrink-0" data-name="Link" href="https://twitter.com/jitsinews">
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

function Link11() {
  return (
    <a className="content-stretch flex items-start pb-[3px] relative shrink-0" data-name="Link" href="https://github.com/jitsi">
      <GhPng />
    </a>
  );
}

function Container18() {
  return (
    <div className="content-stretch cursor-pointer flex gap-[27.3px] items-start pb-[2.14px] pl-[24px] relative shrink-0" data-name="Container">
      <Link8 />
      <Link9 />
      <Link10 />
      <Link11 />
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[21px] pt-[20px] relative shrink-0 w-full" data-name="HorizontalBorder">
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

function Link12() {
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
    <div className="content-stretch flex items-center pb-[56px] pt-[32px] relative shrink-0 w-full" data-name="Container">
      <Link12 />
      <Container20 />
    </div>
  );
}

function Container15() {
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
    <div className="bg-[#131519] relative shrink-0 w-full" data-name="Footer">
      <div className="content-stretch flex flex-col items-start px-[371px] relative w-full">
        <Container15 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-center pt-[40px] relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Footer />
    </div>
  );
}

function Main() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-0 min-h-[900px] right-[10px] top-0" data-name="Main">
      <OverlayBackground />
      <Container8 />
    </div>
  );
}

export default function Component1440WDefault() {
  return (
    <div className="bg-white relative size-full" data-name="1440w default">
      <Main />
    </div>
  );
}