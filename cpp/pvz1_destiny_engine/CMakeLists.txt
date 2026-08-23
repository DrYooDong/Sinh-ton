cmake_minimum_required(VERSION 3.16)
project(Pvz1DestinyEngine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Source files
set(SOURCES
    src/Plant.cpp
    src/Zombie.cpp
    src/LawnGrid.cpp
    src/NationalStream.cpp
    src/DaveShop.cpp
    src/CampaignManager.cpp
    src/main.cpp
)

# Executable target
add_executable(pvz1_engine ${SOURCES})

# Compiler warnings
if(MSVC)
    target_compile_options(pvz1_engine PRIVATE /W4 /utf-8)
else()
    target_compile_options(pvz1_engine PRIVATE -Wall -Wextra -Wpedantic)
endif()
