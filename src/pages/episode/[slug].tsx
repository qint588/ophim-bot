import connectToDatabase from '@/lib/mongoose';
import Episode, { IEpisode } from '@/models/episode.model';
import Movie, { IMovie } from '@/models/movie.model';
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType, InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import Link from 'next/link';
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
    } catch (error) {
        return {
            notFound: true
        }
    }
}) satisfies GetServerSideProps<Data>

export default function MovieEpisode(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <div className='font-sans w-full h-screen'>
            <Head>
                <title>{props.name} ({props.originalName})</title>
            </Head>
            <div className='h-screen flex flex-col max-w-[560px] mx-auto' >
                <div className='p-3 bg-[#000]'>
                    <h2 className='font-bold text-lg text-center uppercase'>{props.name}
                        {props.type != 'single' &&
                            <span className='bg-purple-100 ml-2 relative top-[-2px] text-purple-800 text-sm font-medium me-2 px-2 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300'>{`Tập ${props.episodeName}`}</span>
                        }
                    </h2>
                    <p className='block text-center text-sm'>({props.originalName})</p>
                </div>
                <iframe src={props.episodeEmbed} className='w-full flex-1'></iframe>
                {
                    props.type != 'single' ?
                        <div className='py-2.5 px-3 grid grid-cols-2 gap-3'>
                            <Link href={props.episodePreviousId ? `/episode/${props.episodePreviousId}` : '#'} className='h-[48px] flex items-center justify-center text-white uppercase rounded-lg'>Previous</Link>
                            <Link href={props.episodeNextId ? `/episode/${props.episodeNextId}` : '#'} className='h-[48px] flex items-center justify-center bg-cyan-700 shadow-md transition-all hover:bg-opacity-80 flex-1 rounded-lg uppercase'>Next</Link>
                        </div> : <div className='py-5 bg-[#000]'></div>
                }
            </div >
        </div>
    )
}
