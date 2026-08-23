cmake_minimum_required(VERSION 3.16)
project(PvZ2CardEngine VERSION 2.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Source files
set(SOURCES
    src/Card.cpp
    src/Battlefield.cpp
    src/Player.cpp
    src/StoryManager.cpp
    src/GachaSystem.cpp
    src/FusionSystem.cpp
    src/main.cpp
)

# Executable target
add_executable(pvz2_engine ${SOURCES})

# Compiler warnings
if(MSVC)
    target_compile_options(pvz2_engine PRIVATE /W4 /utf-8)
else()
    target_compile_options(pvz2_engine PRIVATE -Wall -Wextra -Wpedantic)
endif()
