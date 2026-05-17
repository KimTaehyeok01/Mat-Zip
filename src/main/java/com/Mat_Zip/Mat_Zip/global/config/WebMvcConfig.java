package com.Mat_Zip.Mat_Zip.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // uploads 폴더의 파일을 /uploads/** URL로 서빙
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
