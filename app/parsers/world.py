"""解析 Minecraft Java 版存档：读取 level.dat 的 NBT 数据。"""
import os
import nbtlib


def parse_level_dat(level_dat_path):
    """读取 level.dat，返回人类可读的字典。失败返回 None。"""
    if not os.path.exists(level_dat_path):
        return None

    try:
        nbt_file = nbtlib.load(level_dat_path)
    except Exception as e:
        # 文件可能损坏、非标准 gzip，或密码/加密 zip 遗留
        return {"error": f"无法解析 level.dat: {e}"}

    # 不同版本外层结构略有差异，统一取 Data
    root = nbt_file.get("Data", nbt_file.root)

    # 种子：老版本 RandomSeed，1.16+ 在 WorldGenSettings.seed
    seed = root.get("RandomSeed")
    wgs = root.get("WorldGenSettings", {})
    if wgs and not seed:
        seed = wgs.get("seed")
    if seed is not None:
        seed = int(seed)

    # 游戏模式：0生存 1创造 2冒险 3旁观
    game_type = int(root.get("GameType", 0))
    difficulty = int(root.get("Difficulty", 0))

    info = {
        "level_name": str(root.get("LevelName", "未知世界")),
        "seed": seed,
        "game_type": game_type,
        "game_type_text": {0: "生存", 1: "创造", 2: "冒险", 3: "旁观"}.get(game_type, "未知"),
        "difficulty": difficulty,
        "difficulty_text": {0: "和平", 1: "简单", 2: "普通", 3: "困难"}.get(difficulty, "未知"),
        "spawn": [int(root.get(k, 0)) for k in ("SpawnX", "SpawnY", "SpawnZ")],
        "time": int(root.get("Time", 0)),
        "day_time": int(root.get("DayTime", 0)),
        "days_elapsed": int(root.get("Time", 0)) // 24000,
        "last_played": int(root.get("LastPlayed", 0)),
        "data_version": int(root.get("DataVersion", 0)),
        "allow_commands": bool(root.get("allowCommands", False)),
        "hardcore": bool(root.get("hardcore", False)),
        "map_features": bool(root.get("MapFeatures", True)),
    }
    return info


def find_level_dat(world_dir):
    """在一个解压后的目录里找 level.dat（可能在子目录，也可能就在根）。"""
    # 优先根目录
    p = os.path.join(world_dir, "level.dat")
    if os.path.exists(p):
        return p
    # 某些打包方式会把 world 文件夹直接压成根
    for root, dirs, files in os.walk(world_dir):
        if "level.dat" in files:
            return os.path.join(root, "level.dat")
    return None
