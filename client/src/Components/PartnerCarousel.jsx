import React, { Fragment } from "react";

import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";

const photos = [
  {
    src:"/assets/c1.png"
  },
  {
    src:"/assets/c2.png"
  },
  {
    src:"/assets/c3.png"
  },
  {
    src:"/assets/c4.png"
  },
  {
    src:"/assets/c5.png"
  },
 
];

const PartnerCarousel = () => {
  const breakpoint = {
    310: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 30,
    },
    1030: {
      slidesPerView: 4,
      spaceBetween: 40,
    },
  };
  return (
    <Fragment>
      <section className=" mt-5">
        <div className="row justify-content-between ">
          <div className="col-md-4 col-xl-3 col-sm-12">
            <p>
              Trusted by more than 100+
              <br />
              Companies across the globe
            </p>
          </div>
          <div className="col-md-8 col-xl-8 col-sm-12">
            <Swiper
              // install Swiper modules
              modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
              spaceBetween={0}
              slidesPerView={4}
              breakpoints={breakpoint}
              loop={true}
              autoplay={{
                delay: 100,
              }}
              speed={4000}
            >
              {photos.map((photos, index) => {
                return (
                  <SwiperSlide key={index}>
                    <div className=" portfolio-card">
                      <div className="portfolio-card-details">
                        <img
                          src={photos.src}
                          alt=""
                          className="port-img"
                          style={{ width: "150px" }}
                        />
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default PartnerCarousel;
