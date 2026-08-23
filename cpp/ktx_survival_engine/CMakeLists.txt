cmake_minimum_required(VERSION 3.16)
project(KtxSurvivalEngine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Source files
set(SOURCES
    src/Character.cpp
    src/Skill.cpp
    src/Item.cpp
    src/Roommate.cpp
    src/FortressRoom.cpp
    src/CombatEngine.cpp
    src/StoryCampaign.cpp
    src/main.cpp
)

# Executable target
add_executable(ktx_engine ${SOURCES})

# Compiler warnings
if(MSVC)
    target_compile_options(ktx_engine PRIVATE /W4 /utf-8)
else()
    target_compile_options(ktx_engine PRIVATE -Wall -Wextra -Wpedantic)
endif()
