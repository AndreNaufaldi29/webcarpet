"use client";

import HeroSearch from "../components/HeroSearch";
import Category from "../components/Category";
import FeaturedCollection from "../components/FeaturedCollection";
import LatestArrival from "../components/LatestArrival";
import Testimonial from "../components/Testimonial";
import TestimonialForm from "../components/TestimonialForm";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function HomePage() {
  return (
    <>
      <SpeedInsights />
      <HeroSearch />
      <Category />
      <FeaturedCollection />
      <LatestArrival />
      <Testimonial />
      <TestimonialForm />
    </>
  );
}


