import svgPaths from "./svg-ibsq2di4qw";

function Container6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[13.4px] text-center text-white tracking-[-0.272px] whitespace-nowrap">
        <p className="leading-[28px]">N</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#df486f] content-stretch flex flex-col items-start justify-center left-0 overflow-clip rounded-[16.75px] size-[33.5px] top-0" data-name="Background">
      <Container6 />
    </div>
  );
}

function Container5() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 overflow-clip size-[33.5px] top-1/2" data-name="Container">
      <Background />
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(9,36,77,0.9)] content-stretch flex items-start justify-center opacity-0 relative rounded-[2.5px] shrink-0 w-[5px]" data-name="Overlay">
      <div className="bg-[#44a5ff] blur-[0.25px] rounded-[2.5px] shrink-0 size-[5px]" data-name="Background+Blur" />
    </div>
  );
}

function Overlay1() {
  return (
    <div className="bg-[rgba(9,36,77,0.9)] content-stretch flex items-start justify-center opacity-0 relative rounded-[2.5px] shrink-0 w-[5px]" data-name="Overlay">
      <div className="bg-[#44a5ff] blur-[0.25px] rounded-[2.5px] shrink-0 size-[5px]" data-name="Background+Blur" />
    </div>
  );
}

function Overlay2() {
  return (
    <div className="bg-[rgba(9,36,77,0.9)] content-stretch flex items-start justify-center opacity-0 relative rounded-[2.5px] shrink-0 w-[5px]" data-name="Overlay">
      <div className="bg-[#44a5ff] blur-[0.25px] rounded-[2.5px] shrink-0 size-[5px]" data-name="Background+Blur" />
    </div>
  );
}

function Overlay3() {
  return (
    <div className="bg-[rgba(9,36,77,0.9)] content-stretch flex items-start justify-center opacity-0 relative rounded-[2.5px] shrink-0 w-[5px]" data-name="Overlay">
      <div className="bg-[#44a5ff] blur-[0.25px] rounded-[2.5px] shrink-0 size-[5px]" data-name="Background+Blur" />
    </div>
  );
}

function Overlay4() {
  return (
    <div className="bg-[rgba(9,36,77,0.9)] content-stretch flex items-start justify-center opacity-0 relative rounded-[2.5px] shrink-0 w-[5px]" data-name="Overlay">
      <div className="bg-[#44a5ff] blur-[0.25px] rounded-[2.5px] shrink-0 size-[5px]" data-name="Background+Blur" />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start pb-[3px] pt-[6px] relative shrink-0" data-name="Container">
      <Overlay />
      <Overlay1 />
      <Overlay2 />
      <Overlay3 />
      <Overlay4 />
    </div>
  );
}

function Container7() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col h-[42px] items-center left-[8px] top-[calc(50%-1px)] w-[6px]" data-name="Container">
      <Container8 />
    </div>
  );
}

function Img() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Img - Без звука">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Img - ÐÐµÐ· Ð·Ð²ÑÐºÐ°">
          <path clipRule="evenodd" d={svgPaths.pc029df0} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path d={svgPaths.pcbfca00} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p13405f00} fill="var(--fill-0, white)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Img />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Container">
      <Container11 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[8px] relative shrink-0" data-name="Margin">
      <Container10 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-center overflow-clip relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="leading-[16px]">Nik888ii</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex items-start overflow-clip relative shrink-0" data-name="Container">
      <Container13 />
    </div>
  );
}

function Overlay5() {
  return (
    <div className="bg-[rgba(0,0,0,0.7)] content-stretch flex items-center max-w-[136px] overflow-clip px-[8px] py-[4px] relative rounded-[4px] self-stretch shrink-0" data-name="Overlay">
      <Margin1 />
      <Container12 />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute bottom-[2px] content-stretch flex items-start left-[2px] p-[4px] right-[2px]" data-name="Container">
      <Overlay5 />
    </div>
  );
}

function Container4() {
  return (
    <div className="min-h-[71px] min-w-[124px] overflow-clip relative rounded-[4px] shrink-0 size-[124px]" data-name="Container">
      <div className="absolute bg-[#292929] inset-[2px] rounded-[4px]" data-name="Background" />
      <Container5 />
      <Container7 />
      <Container9 />
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start pl-[2px] pr-[9px] relative w-full">
        <Container4 />
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="bg-[#1c1c1c] content-stretch flex flex-col items-start pb-[5px] relative shrink-0 w-[129px]" data-name="Margin">
      <Container3 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px pb-[16.5px] pt-[15.5px] relative w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-white tracking-[-0.272px] whitespace-nowrap">
        <p className="leading-[28px]">9</p>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-[#4380e2] content-stretch flex flex-col items-start justify-center left-0 overflow-clip rounded-[30px] size-[60px] top-0" data-name="Background">
      <Container18 />
    </div>
  );
}

function Container17() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 overflow-clip size-[60px] top-1/2" data-name="Container">
      <Background1 />
    </div>
  );
}

function Overlay6() {
  return (
    <div className="bg-[rgba(9,36,77,0.9)] content-stretch flex items-start justify-center opacity-0 relative rounded-[2.5px] shrink-0 w-[5px]" data-name="Overlay">
      <div className="bg-[#44a5ff] blur-[0.25px] rounded-[2.5px] shrink-0 size-[5px]" data-name="Background+Blur" />
    </div>
  );
}

function Overlay7() {
  return (
    <div className="bg-[rgba(9,36,77,0.9)] content-stretch flex items-start justify-center opacity-0 relative rounded-[2.5px] shrink-0 w-[5px]" data-name="Overlay">
      <div className="bg-[#44a5ff] blur-[0.25px] rounded-[2.5px] shrink-0 size-[5px]" data-name="Background+Blur" />
    </div>
  );
}

function Overlay8() {
  return (
    <div className="bg-[rgba(9,36,77,0.9)] content-stretch flex items-start justify-center opacity-0 relative rounded-[2.5px] shrink-0 w-[5px]" data-name="Overlay">
      <div className="bg-[#44a5ff] blur-[0.25px] rounded-[2.5px] shrink-0 size-[5px]" data-name="Background+Blur" />
    </div>
  );
}

function Overlay9() {
  return (
    <div className="bg-[rgba(9,36,77,0.9)] content-stretch flex items-start justify-center opacity-0 relative rounded-[2.5px] shrink-0 w-[5px]" data-name="Overlay">
      <div className="bg-[#44a5ff] blur-[0.25px] rounded-[2.5px] shrink-0 size-[5px]" data-name="Background+Blur" />
    </div>
  );
}

function Overlay10() {
  return (
    <div className="bg-[rgba(9,36,77,0.9)] content-stretch flex items-start justify-center opacity-0 relative rounded-[2.5px] shrink-0 w-[5px]" data-name="Overlay">
      <div className="bg-[#44a5ff] blur-[0.25px] rounded-[2.5px] shrink-0 size-[5px]" data-name="Background+Blur" />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start pb-[3px] pt-[6px] relative shrink-0" data-name="Container">
      <Overlay6 />
      <Overlay7 />
      <Overlay8 />
      <Overlay9 />
      <Overlay10 />
    </div>
  );
}

function Container19() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col h-[42px] items-center left-[8px] top-[calc(50%-1px)] w-[6px]" data-name="Container">
      <Container20 />
    </div>
  );
}

function Img1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Img - Без звука">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Img - ÐÐµÐ· Ð·Ð²ÑÐºÐ°">
          <path clipRule="evenodd" d={svgPaths.pc029df0} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path d={svgPaths.pcbfca00} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p13405f00} fill="var(--fill-0, white)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Img1 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Container">
      <Container23 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pr-[8px] relative shrink-0" data-name="Margin">
      <Container22 />
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-center overflow-clip relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="leading-[16px]">90</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex items-start overflow-clip relative shrink-0" data-name="Container">
      <Container25 />
    </div>
  );
}

function Overlay11() {
  return (
    <div className="bg-[rgba(0,0,0,0.7)] content-stretch flex items-center max-w-[136px] overflow-clip px-[8px] py-[4px] relative rounded-[4px] self-stretch shrink-0" data-name="Overlay">
      <Margin2 />
      <Container24 />
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute bottom-[2px] content-stretch flex items-start left-[2px] p-[4px] w-[120px]" data-name="Container">
      <Overlay11 />
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute left-[2px] overflow-clip rounded-[4px] size-[124px] top-0" data-name="Container">
      <div className="absolute bg-[#292929] left-[2px] rounded-[4px] size-[120px] top-[2px]" data-name="Background" />
      <Container17 />
      <div className="absolute bg-[#040404] left-[2px] opacity-80 size-[120px] top-[2px]" data-name="Background" />
      <Container19 />
      <Container21 />
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute bottom-0 h-[124px] left-0 right-0" data-name="Container">
      <Container16 />
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-[#1c1c1c] h-[664px] overflow-auto relative shrink-0 w-[129px]" data-name="Container">
      <Container15 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px pr-[2px] py-[2px] relative w-[137px]" data-name="Container">
      <Margin />
      <Container14 />
    </div>
  );
}

function Svg() {
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

function Container26() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[4px] relative w-full">
        <Svg />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative rounded-[4px]" data-name="Button - Включить диафильм">
      <Container26 />
    </div>
  );
}

function Overlay12() {
  return (
    <div className="bg-[rgba(51,51,51,0.5)] content-stretch flex h-[24px] items-center justify-center opacity-0 relative rounded-[4px] w-[32px]" data-name="Overlay">
      <Button />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[797px] items-end max-w-[135px] right-0 top-0 w-[135px]" data-name="Container">
      <Container2 />
      <div className="absolute flex h-[32px] items-center justify-center left-[-26px] top-[382.5px] w-[24px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "154" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <Overlay12 />
        </div>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start min-w-[181.3000030517578px] overflow-clip relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[24px]">Casual Prizes Rely Strangely</p>
      </div>
    </div>
  );
}

function Overlay13() {
  return (
    <div className="bg-[rgba(0,0,0,0.6)] content-stretch flex flex-col h-[28px] items-start max-w-[324px] px-[16px] py-[2px] relative rounded-bl-[6px] rounded-tl-[6px] shrink-0" data-name="Overlay">
      <Container30 />
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col h-[28px] items-start max-w-[326px] pl-[2px] relative shrink-0" data-name="Margin">
      <Overlay13 />
    </div>
  );
}

function Overlay14() {
  return (
    <div className="bg-[rgba(0,0,0,0.8)] content-stretch flex flex-col h-[28px] items-start px-[8px] py-[6px] relative rounded-br-[6px] rounded-tr-[6px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
        <p className="leading-[16px]">18:37</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="content-stretch flex flex-col h-[28px] items-start pr-[2px] relative shrink-0" data-name="Margin">
      <Overlay14 />
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p20ec6500} fill="var(--fill-0, #040404)" fillRule="evenodd" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p38c4b400} fill="var(--fill-0, #040404)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg1 />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#e0e0e0] content-stretch flex h-[28px] items-center p-[6px] relative rounded-[4px] shrink-0" data-name="Button">
      <Container31 />
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="content-stretch flex flex-col h-[28px] items-start px-[2px] relative shrink-0" data-name="Button:margin">
      <Button1 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-start flex flex-wrap gap-0 h-[28px] items-start justify-center relative shrink-0" data-name="Container">
      <Margin3 />
      <Margin4 />
      <ButtonMargin />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col h-full items-center relative shrink-0" data-name="Container">
      <Container29 />
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-start justify-center left-0 pt-[20px] right-0 top-0" data-name="Container">
      <Container28 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px pb-[43.14px] pt-[41.86px] relative w-full" data-name="Container">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[80px] text-center text-white whitespace-nowrap">
        <p className="leading-[114.29px]">9</p>
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#4380e2] content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[100px] shrink-0 size-[200px]" data-name="Background">
      <Container34 />
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 size-[200px]" data-name="Container">
      <Background3 />
    </div>
  );
}

function Overlay15() {
  return (
    <div className="bg-[rgba(0,0,0,0.6)] content-stretch flex flex-col items-center max-w-[282px] overflow-clip pb-[1.73px] pt-[1.5px] px-[16px] relative rounded-[3px] shrink-0" data-name="Overlay">
      <div className="flex flex-col font-['Arial:Narrow',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[15.2px] text-center text-white whitespace-nowrap">
        <p className="leading-[21.23px]">90</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute bottom-[88px] content-stretch flex items-center justify-center left-0 w-[500px]" data-name="Container">
      <Overlay15 />
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

function LinkJitsiMeet() {
  return (
    <a className="absolute content-stretch cursor-pointer flex flex-col h-[32px] items-start left-[32px] max-h-[70px] max-w-[140px] top-[32px] w-[71px]" data-name="Link - Jitsi Meet Логотип, ссылки на главную страницу" href="https://jitsi.org/">
      <Image />
    </a>
  );
}

function Background2() {
  return (
    <div className="absolute bg-[#040404] content-stretch flex flex-col h-[876px] items-center justify-center left-0 overflow-clip top-0 w-[500px]" data-name="Background">
      <Container33 />
      <Container35 />
      <LinkJitsiMeet />
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="Container">
      <Background2 />
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p1d6f6100} fill="var(--fill-0, #858585)" fillRule="evenodd" id="Vector" />
          <path d={svgPaths.p2bcc780} fill="var(--fill-0, #858585)" id="Vector_2" />
          <path d={svgPaths.p1528db80} fill="var(--fill-0, #858585)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Container39() {
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
    <div className="bg-[#c2c2c2] content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Background">
      <Container39 />
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Button - Включить микрофон">
      <Background4 />
    </div>
  );
}

function ButtonMargin1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Button - Включить микрофон:margin">
      <Button2 />
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

function Container40() {
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
      <Container40 />
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Button - Включить камеру">
      <Background5 />
    </div>
  );
}

function ButtonMargin2() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Button - Включить камеру:margin">
      <Button3 />
    </div>
  );
}

function Svg4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p30da4300} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p20cc700} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container42() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg4 />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Container">
      <Container42 />
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Button - Вкл/Выкл демонстрацию экрана">
      <Container41 />
    </div>
  );
}

function ButtonMargin3() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Button - Вкл/Выкл демонстрацию экрана:margin">
      <Button4 />
    </div>
  );
}

function Svg5() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2cb6fc00} fill="var(--fill-0, white)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p17b686f0} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container45() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg5 />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Container">
      <Container45 />
    </div>
  );
}

function Button5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Button - Открыть чат">
      <Container44 />
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative" data-name="Container">
      <Button5 />
    </div>
  );
}

function Margin5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Margin">
      <Container43 />
    </div>
  );
}

function Svg6() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2fdc3300} fill="var(--fill-0, white)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p24d05480} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container47() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg6 />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Container">
      <Container47 />
    </div>
  );
}

function Button6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Button - Поднять руку">
      <Container46 />
    </div>
  );
}

function ButtonMargin4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Button - Поднять руку:margin">
      <Button6 />
    </div>
  );
}

function Svg7() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p2b1a5040} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
          <path d={svgPaths.p1d47dc0} fill="var(--fill-0, white)" id="Vector_2" />
          <path clipRule="evenodd" d={svgPaths.pf2c8a00} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Container50() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg7 />
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Container">
      <Container50 />
    </div>
  );
}

function Button7() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Button - Участники">
      <Container49 />
    </div>
  );
}

function Background6() {
  return (
    <div className="absolute bg-[#3d3d3d] content-stretch flex flex-col h-[18px] items-center min-w-[18px] pl-[5.25px] pr-[5.27px] py-px right-[-4.52px] rounded-[18px] top-[-3px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap">
        <p className="leading-[16px]">2</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative" data-name="Container">
      <Button7 />
      <Background6 />
    </div>
  );
}

function Margin6() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Margin">
      <Container48 />
    </div>
  );
}

function Svg8() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path clipRule="evenodd" d={svgPaths.p2b557200} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container53() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg8 />
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Container">
      <Container53 />
    </div>
  );
}

function Button8() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Button - Показать/скрыть меню доп. настроек">
      <Container52 />
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative" data-name="Container">
      <Button8 />
    </div>
  );
}

function Margin7() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center pr-[8px] relative self-stretch shrink-0" data-name="Margin">
      <Container51 />
    </div>
  );
}

function Svg9() {
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

function Container54() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Svg9 />
      </div>
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#cb2233] content-stretch flex flex-col items-start justify-center relative rounded-[3px] shrink-0 size-[48px]" data-name="Background">
      <Container54 />
    </div>
  );
}

function Button9() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Button - Завершить звонок">
      <Background7 />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-[#141414] relative shadow-[0px_2px_8px_4px_rgba(0,0,0,0.25),0px_0px_0px_1px_rgba(0,0,0,0.15)] shrink-0 w-full" data-name="Background+Shadow">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[6.7px] items-start pl-[6.66px] pr-[6.67px] py-[8px] relative w-full">
          <ButtonMargin1 />
          <ButtonMargin2 />
          <ButtonMargin3 />
          <Margin5 />
          <ButtonMargin4 />
          <Margin6 />
          <Margin7 />
          <Button9 />
        </div>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative rounded-[6px]" data-name="Container">
      <BackgroundShadow />
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Container38 />
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col items-start left-0 right-0" data-name="Container">
      <Container37 />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[876px] relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container27 />
      <Container32 />
      <Container36 />
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

export default function Component500WDefault() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="500w default" style={{ backgroundImage: "linear-gradient(90deg, rgb(4, 4, 4) 0%, rgb(4, 4, 4) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Main />
    </div>
  );
}