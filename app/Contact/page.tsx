import Containers from "@/components/containers"
export default function  Contact () {
  return (
    <Containers className="min-h-[200vh] px-8 pt-24 md:p-20 md:pb-10 mx-auto">
         <div
          className="absolute right-0 top-0 h-full w-6 border-x border-x-(--pattern-fg) 
          bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)]
          bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"
        > </div>

        {/* LEFT BORDER */}
        <div
          className="absolute left-0 top-0 h-full  w-6 border-x border-x-(--pattern-fg) 
          bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)]
          bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"
        ></div>
        <h1 className="text-neutral-900 dark:text-neutral-50 font-custom font-semibold text-3xl tracking-tight  ">
        <span className="link--elara">Contact</span>
    
      </h1>  
      <p className="  tracking-tight font-custom2 text-neutral-600 dark:text-neutral-400 max-w-lg text-sm md:text-base mt-2 ">Hi there drop any question you have whether related project  or anything or just want to connect</p>   

       </Containers>
  )
}
