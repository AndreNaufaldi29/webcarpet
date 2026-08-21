"use client";

import HeroSearch from "../components/HeroSearch";
import Category from "../components/Category";
import FeaturedCollection from "../components/FeaturedCollection";
import LatestArrival from "../components/LatestArrival";
import Testimonial from "../components/Testimonial";
import TestimonialForm from "../components/TestimonialForm";

export default function HomePage() {
  return (
    <>
      <HeroSearch />
      <Category />
      <FeaturedCollection />
      <LatestArrival />
      <Testimonial />
      <TestimonialForm />
    </>
  );
}


