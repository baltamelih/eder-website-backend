import { useEffect, useState } from "react";
import "./home-hero-media.css";

// EDER_03F4_CINEMATIC_HERO_3D_PROGRESS
const VIDEO_4K =
  "https://videos.pexels.com/video-files/13796181/13796181-uhd_3840_2160_24fps.mp4";
const POSTER =
  "https://images.pexels.com/videos/13796181/pexels-photo-13796181.jpeg?auto=compress&cs=tinysrgb&w=2560";
const LOCAL_FALLBACK = "/media/eder/home/hero-studio.jpg";

function getDesktopMotionCapability() {
  if (typeof window === "undefined") return false;

  const media = window.matchMedia("(min-width: 980px)");
  const saveData = navigator.connection?.saveData === true;
  return media.matches && !saveData;
}

export default function HomeHeroMedia({ reducedMotion = false }) {
  const [desktopMotion, setDesktopMotion] = useState(getDesktopMotionCapability);
  const [remotePosterFailed, setRemotePosterFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 980px)");
    const connection = navigator.connection;

    const update = () => {
      setDesktopMotion(media.matches && connection?.saveData !== true);
    };

    media.addEventListener?.("change", update);
    connection?.addEventListener?.("change", update);

    return () => {
      media.removeEventListener?.("change", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  const poster = remotePosterFailed ? LOCAL_FALLBACK : POSTER;
  const showVideo = !reducedMotion && desktopMotion && !videoFailed;

  return (
    <div className="home-cinema-media" aria-hidden>
      {showVideo ? (
        <video
          className="home-cinema__image home-cinema__video"
          poster={poster}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          onError={() => setVideoFailed(true)}
        >
          <source src={VIDEO_4K} type="video/mp4" />
        </video>
      ) : (
        <img
          className="home-cinema__image"
          src={poster}
          alt=""
          fetchPriority="high"
          onError={() => setRemotePosterFailed(true)}
        />
      )}

      <img
        className="home-cinema-media__fallback-probe"
        src={poster}
        alt=""
        onError={() => setRemotePosterFailed(true)}
      />
    </div>
  );
}
