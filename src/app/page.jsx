"use client";

import HeroSearch from "../components/HeroSearch";
import Testimonial from "../components/Testimonial";
import TestimonialForm from "../components/TestimonialForm";
import Category from "../components/Category";
import FeaturedCollection from "../components/FeaturedCollection";
import LatestArrival from "../components/LatestArrival";

export default function HomePage() {
  return (
    <>
      <HeroSearch />
      <Testimonial />
      <TestimonialForm />
      <Category />
      <FeaturedCollection />
      <LatestArrival />
    </>
  );
}

