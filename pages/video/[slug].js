import React from "react";
import { gql, GraphQLClient } from "graphql-request";
import Link from "next/Link";

export const getServerSideProps = async (pageContext) => {
    const url = process.env.ENDPOINT;
    const graphQLClient = new GraphQLClient(url, {
        headers: {
            Authorization: `Bearer ${process.env.GRAPH_CMS_TOKEN}`,
        },
    });
    const pageSlug = pageContext.query.slug;

    const query = gql`
        query ($pageSlug: String!) {
            video(where: { slug: $pageSlug }) {
                createdAt
                id
                title
                description
                seen
                slug
                tags
                thumbnail {
                    url
                }
                mp4 {
                    url
                }
            }
        }
    `;

    const variables = {
        pageSlug,
    };

    const data = await graphQLClient.request(query, variables);
    const video = data.video;

    return {
        props: {
            video,
        },
    };
};
const changeToSeen = async (slug) => {
    await fetch("/api/changeToSeen", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
    });
};

const Video = ({ video }) => {
    const [watching, setWatching] = React.useState(false);

    return (
        <>
            {!watching && (
                <img className="video-image" src={video.thumbnail.url} alt={video.title} />
            )}
            {!watching && (
                <div className="info">
                    <p>{video.tags.join(", ")}</p>
                    <p>{video.description}</p>
                    <Link href="/">
                        <p>Home</p>
                    </Link>
                    <button
                        className="video-overlay"
                        onClick={() => {
                            changeToSeen(video.slug);
                            watching ? setWatching(false) : setWatching(true);
                        }}
                    >
                        PLAY
                    </button>
                </div>
            )}
            {watching && (
                <div
                    style={{
                        marginTop: "2vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Link href="/">
                        <p>go Home</p>
                    </Link>
                    <video width="75%" controls>
                        <source src={video.mp4.url} type="video/mp4" />
                    </video>
                </div>
            )}
            <div
                className="info-footer"
                onClick={() => (watching ? setWatching(false) : null)}
            ></div>
        </>
    );
};

export default Video;
