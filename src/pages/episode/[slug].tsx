import { useTelegram } from '@/hooks/useTelegram';
import connectToDatabase from '@/lib/mongoose';
import Episode, { IEpisode } from '@/models/episode.model';
import Movie, { IMovie } from '@/models/movie.model';
import axios from 'axios';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import React from 'react'

type Data = {
    name: string,
    originalName: string,
    episodeName: string,
    episodeEmbed: string,
    type: string,
    episodePreviousId: string | null,
    episodeNextId: string | null,
}

export const getServerSideProps = (async (context) => {
    try {
        await connectToDatabase()

        const slug = context.params?.slug as string
        const episode: IEpisode | null = await Episode.findOne({
            _id: slug
        })
        if (!episode) {
            throw new Error('Episode not found')
        }

        const previousEpisode = await Episode.findOne({
            _id: { $lt: episode._id },
            movie: episode.movie,
            server: episode.server
        }).sort({ _id: -1 });

        const nextEpisode = await Episode.findOne({
            _id: { $gt: episode._id },
            movie: episode.movie,
            server: episode.server
        }).sort({ _id: 1 });

        const movie: IMovie | null = await Movie.findOne({
            _id: episode.movie
        })
        if (!movie) {
            throw new Error('Movie not found')
        }
        return {
            props: {
                name: movie.name,
                originalName: movie.originalName,
                episodeEmbed: episode.episodeLinkEmbed,
                episodeName: episode.name,
                type: movie.type,
                episodePreviousId: previousEpisode?._id?.toString() || '',
                episodeNextId: nextEpisode?._id?.toString() || '',
            }
        }
    } catch (error: unknown) {
        console.log('Error', error);
        return {
            notFound: true
        }
    }
}) satisfies GetServerSideProps<Data>

export default function MovieEpisode(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { initDataUnsafe, themeParams, height } = useTelegram();
    const router = useRouter()

    const handleNextAction = () => {
        if (!props.episodeNextId) {
            return alert('⚠️ Sorry, There are no more episodes, please watch other episodes')
        }
        handleChooseEpisode(props.episodeNextId)
        router.push(`/episode/${props.episodeNextId}`)
    }

    const handlePreviousAction = () => {
        if (!props.episodePreviousId) {
            return alert('⚠️ Sorry, There are no more episodes, please watch other episodes')
        }
        handleChooseEpisode(props.episodePreviousId)
        router.push(`/episode/${props.episodePreviousId}`)
    }

    const handleChooseEpisode = async (id: string) => {
        try {
            const response = await axios.post('/api/choose-episode', {
                userId: initDataUnsafe?.user?.id,
                episodeId: id
            })
            console.log(response);
        } catch (error) {
            console.log('Error', error);
        }
    }

    return (
        <div
            style={{
                backgroundColor: themeParams?.bg_color || '#ffffff',
                color: themeParams?.text_color || '#000000',
                height: height ? `${height}px` : '100vh',
                overflow: 'hidden'
            }}
            className='font-sans'
        >
            <Script src="https://telegram.org/js/telegram-web-app.js" />
            <Head>
                <title>{props.name} ({props.originalName})</title>
            </Head>
            <div className='h-full flex flex-col max-w-[560px] mx-auto' >
                <div className='p-3 bg-[#000]'>
                    <h2 className='font-bold text-lg text-center uppercase'>{props.name}
                        {props.type != 'single' &&
                            <span className='bg-purple-100 ml-2 relative top-[-2px] text-purple-800 text-sm font-medium me-2 px-2 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300'>{`Tập ${props.episodeName}`}</span>
                        }
                    </h2>
                    <p className='block text-center text-sm'>({props.originalName})</p>
                </div>
                <iframe src={props.episodeEmbed} className='w-full flex-1'></iframe>
                <div className='py-2.5 px-1 grid grid-cols-2 gap-3'>
                    <button onClick={handlePreviousAction} className='h-[48px] flex items-center justify-center text-white uppercase rounded-full'>Previous</button>
                    <button onClick={handleNextAction} className='h-[48px] flex items-center justify-center bg-cyan-700 shadow-md transition-all hover:bg-opacity-80 flex-1  rounded-full uppercase'>Next</button>
                </div>
            </div >
        </div>
    );
}
