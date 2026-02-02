import svgPaths from "./svg-3r628gdny7";
import { imgVector } from "./svg-dpbrc";

function Container1() {
  return <div className="absolute bg-[#040404] blur-[20px] h-[944px] left-0 top-0 w-[810px]" data-name="Container" />;
}

function Container2() {
  return <div className="absolute bg-[rgba(255,255,255,0)] h-[944px] left-0 shadow-[0px_0px_20px_0px_#444] top-0 w-[810px]" data-name="Container" />;
}

function Group() {
  return (
    <div className="absolute contents inset-[0_1.2%_0_0]" data-name="Group">
      <div className="absolute inset-[0_69.81%_0_0] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[71px_32px]" data-name="Vector" style={{ maskImage: `url('${imgVector}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.4344 32">
          <path d={svgPaths.p187d5d00} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[5.06%_56.81%_2.95%_34.24%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-24.309px_-1.62px] mask-size-[71px_32px]" data-name="Vector" style={{ maskImage: `url('${imgVector}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.35942 29.4355">
          <path d={svgPaths.p38f676a8} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[5.06%_46.57%_23.98%_49.85%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-35.395px_-1.62px] mask-size-[71px_32px]" data-name="Vector" style={{ maskImage: `url('${imgVector}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.54102 22.7078">
          <path d={svgPaths.pcf6f580} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[10.64%_30.74%_23.01%_57.07%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-40.52px_-3.405px] mask-size-[71px_32px]" data-name="Vector" style={{ maskImage: `url('${imgVector}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.6521 21.23">
          <path d={svgPaths.p3e029500} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[23%_10.01%_23.02%_72.14%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-51.221px_-7.36px] mask-size-[71px_32px]" data-name="Vector" style={{ maskImage: `url('${imgVector}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.6701 17.2736">
          <path d={svgPaths.p15b0a370} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[5.06%_1.2%_23.98%_95.22%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-67.607px_-1.62px] mask-size-[71px_32px]" data-name="Vector" style={{ maskImage: `url('${imgVector}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.54104 22.7078">
          <path d={svgPaths.p22dea580} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute contents inset-0" data-name="Clip path group">
      <Group />
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[32px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <ClipPathGroup />
    </div>
  );
}

function JitsiLogo() {
  return (
    <div className="content-stretch flex flex-col h-[32px] items-start relative shrink-0 w-full" data-name="JitsiLogo">
      <Icon />
    </div>
  );
}

function Link() {
  return (
    <div className="absolute content-stretch flex flex-col h-[32px] items-start left-[32px] top-[32px] w-[71px]" data-name="Link">
      <JitsiLogo />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[944px] left-0 top-0 w-[810px]" data-name="Container">
      <Container1 />
      <Container2 />
      <Link />
    </div>
  );
}

function UserIcon() {
  return (
    <div className="relative shrink-0 size-[100px]" data-name="UserIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
        <g id="UserIcon">
          <path clipRule="evenodd" d={svgPaths.p37acea00} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-[#aaa] relative rounded-[33554400px] shrink-0 size-[200px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <UserIcon />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[#040404] flex-[1_0_0] min-h-px min-w-px relative w-[810px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container5 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[73px] relative shrink-0 w-full" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center relative size-full">
        <div className="flex flex-col font-['Arial:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[28px] text-center text-white whitespace-nowrap">
          <p className="leading-[36px]">Join meeting</p>
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex h-[28px] items-start left-0 top-0 w-[400px]" data-name="Container">
      <p className="flex-[1_0_0] font-['Arial:Bold',sans-serif] leading-[28px] min-h-px min-w-px not-italic relative text-[20px] text-center text-white whitespace-pre-wrap">124 F 334 G 43 Ghh</p>
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute bg-[#3d3d3d] content-stretch flex h-[40px] items-center left-0 overflow-clip px-[16px] py-[12px] rounded-[8px] top-[52px] w-[400px]" data-name="Text Input">
      <p className="font-['Arial:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#c2c2c2] text-[14px]">Enter your name</p>
    </div>
  );
}

function MicrophoneIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="MicrophoneIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="MicrophoneIcon">
          <path clipRule="evenodd" d={svgPaths.p1d6f6100} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path d={svgPaths.p2bcc780} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p1528db80} fill="var(--fill-0, white)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#3d3d3d] flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[6px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <MicrophoneIcon />
      </div>
    </div>
  );
}

function CameraIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="CameraIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="CameraIcon">
          <path clipRule="evenodd" d={svgPaths.p2fb9f180} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path d={svgPaths.p3d6cf980} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#3d3d3d] flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[6px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <CameraIcon />
      </div>
    </div>
  );
}

function InviteIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="InviteIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="InviteIcon">
          <path d={svgPaths.p23658e80} fill="var(--fill-0, white)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.pb36eb00} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[6px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <InviteIcon />
      </div>
    </div>
  );
}

function BackgroundIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="BackgroundIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="BackgroundIcon">
          <path clipRule="evenodd" d={svgPaths.p373cd500} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.peac8700} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[6px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <BackgroundIcon />
      </div>
    </div>
  );
}

function SettingsIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SettingsIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SettingsIcon">
          <path clipRule="evenodd" d={svgPaths.pe3b500} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.pee08300} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[6px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <SettingsIcon />
      </div>
    </div>
  );
}

function LeaveIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="LeaveIcon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="LeaveIcon">
          <path clipRule="evenodd" d={svgPaths.p1cd36400} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#cb2233] relative rounded-[6px] shrink-0 size-[48px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <LeaveIcon />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex h-[64px] items-center justify-between left-0 pr-[-0.031px] top-[168px] w-[400px]" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute bg-[#2d5fa1] h-[44px] left-0 opacity-50 rounded-[8px] top-0 w-[400px]" data-name="Button">
      <p className="-translate-x-1/2 absolute font-['Arial:Bold',sans-serif] leading-[24px] left-[200.56px] not-italic text-[16px] text-center text-white top-[8px]">Join meeting</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Icon">
          <path d="M6 9L12 15L18 9" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="absolute content-stretch flex h-[44px] items-center justify-center left-[364px] opacity-50 rounded-br-[8px] rounded-tr-[8px] top-0 w-[36px]" data-name="Button">
      <Icon1 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[44px] left-0 top-[108px] w-[400px]" data-name="Container">
      <Button6 />
      <Button7 />
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[232px] relative shrink-0 w-[400px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container8 />
        <TextInput />
        <Container9 />
        <Container10 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[321px] relative shrink-0 w-[810px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-end py-[16px] relative size-full">
        <Heading />
        <Container7 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-[#141414] content-stretch flex flex-col h-[944px] items-start left-0 top-0 w-[810px]" data-name="Container">
      <Container4 />
      <Container6 />
    </div>
  );
}

export default function JitsiCallPage() {
  return (
    <div className="bg-[#040404] relative size-full" data-name="Jitsi Call Page">
      <Container />
      <Container3 />
    </div>
  );
}