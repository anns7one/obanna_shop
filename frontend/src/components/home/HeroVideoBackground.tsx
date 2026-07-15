export function HeroVideoBackground() {
  return (
    <div className="hero-video-bg" aria-hidden="true">
      <video
        className="hero-video-bg-video"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4"
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
      />
      <div className="hero-video-bg-scrim" />
    </div>
  );
}
