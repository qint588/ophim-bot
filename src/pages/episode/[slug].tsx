import localFont from 'next/font/local';
import React from 'react'

const geistSans = localFont({
    src: "./../fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./../fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export default function MovieEpisode() {
    return (
        <div
            className={`${geistSans.variable} ${geistMono.variable}font-[family-name:var(--font-geist-sans)]`}
        >
            <div className='h-[100vh] flex flex-col max-w-[560px] mx-auto'>
                <div className='p-3 bg-[#000]'>
                    <h2 className='font-bold text-lg text-center uppercase'>Buồn vui cuộc đời cần thủ <span className='bg-purple-100 relative top-[-2px] text-purple-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300'>Tập 6</span></h2>
                    <p className='block text-center text-sm'>(Negative Positive Angler)</p>
                </div>
                <iframe src='https://vip.opstream15.com/share/ca772cc23c0069d24e8d7e6dd0b7b40c' className='w-full flex-1'></iframe>
                {/* <div className='py-2.5 px-3 grid grid-cols-2 gap-3'>
                    <button className='h-[50px] text-white uppercase rounded-lg'>Previous</button>
                    <button className='h-[50px] bg-cyan-700 shadow-md transition-all hover:bg-opacity-80 text-base flex-1 rounded-lg uppercase'>Next</button>
                </div> */}
            </div>
        </div>
    )
}
