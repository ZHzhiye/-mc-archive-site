"""解析 Minecraft Mod（jar/zip）：识别加载器与元数据。"""
import io
import json
import zipfile

try:
    import tomllib  # Python 3.11+
except ImportError:
    import tomli as tomllib  # type: ignore


def _read_zip_file(zf, name):
    try:
        return zf.read(name)
    except KeyError:
        return None


def parse_mod(file_bytes):
    """接收 jar 文件二进制内容，返回 mod 信息字典。"""
    result = {
        "loader": "unknown",
        "modid": None,
        "display_name": None,
        "version": None,
        "description": None,
        "authors": [],
        "minecraft_version": None,
        "dependencies": [],
        "filename_note": None,
    }

    try:
        zf = zipfile.ZipFile(io.BytesIO(file_bytes))
    except zipfile.BadZipFile:
        return {**result, "loader": "invalid", "filename_note": "不是有效的 zip/jar 文件"}

    names = set(zf.namelist())

    # ---------- Fabric / Quilt ----------
    if "fabric.mod.json" in names:
        raw = _read_zip_file(zf, "fabric.mod.json")
        if raw:
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                data = {}
            result["loader"] = "fabric"
            result["modid"] = data.get("id")
            result["display_name"] = data.get("name") or data.get("id")
            result["version"] = data.get("version")
            result["description"] = data.get("description")
            result["authors"] = [
                a if isinstance(a, str) else a.get("name")
                for a in (data.get("authors") or [])
            ]
            deps = data.get("depends") or {}
            result["dependencies"] = [
                {"id": k, "version": v} for k, v in deps.items()
            ]
            mc = deps.get("minecraft")
            if mc:
                result["minecraft_version"] = str(mc)
            return result

    # ---------- Forge (mods.toml, 新) ----------
    if "META-INF/mods.toml" in names:
        raw = _read_zip_file(zf, "META-INF/mods.toml")
        if raw:
            try:
                data = tomllib.loads(raw.decode("utf-8"))
            except Exception:
                data = {}
            result["loader"] = "forge"
            mods = data.get("mods") or []
            if mods:
                m = mods[0]
                result["modid"] = m.get("modId")
                result["display_name"] = m.get("displayName") or m.get("modId")
                result["version"] = m.get("version")
                result["description"] = m.get("description")
                authors = m.get("authors") or ""
                result["authors"] = [a.strip()] for a in authors.split(",") if a.strip()
            deps = data.get("dependencies") or {}
            for mod_id, dep_list in deps.items():
                for d in dep_list:
                    result["dependencies"].append({
                        "id": d.get("modId"),
                        "version_range": d.get("versionRange"),
                    })
                    if d.get("modId") == "minecraft":
                        result["minecraft_version"] = str(d.get("versionRange"))
            return result

    # ---------- 老板 Forge (mcmod.info, JSON) ----------
    if "mcmod.info" in names:
        raw = _read_zip_file(zf, "mcmod.info")
        if raw:
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                data = None
            if isinstance(data, dict):
                data = data.get("modList", [data])
            result["loader"] = "forge-legacy"
            if isinstance(data, list) and data:
                m = data[0]
                result["modid"] = m.get("modid")
                result["display_name"] = m.get("name")
                result["version"] = m.get("version")
                result["description"] = m.get("description")
                result["authors"] = m.get("authorList") or []
                result["minecraft_version"] = m.get("mcversion")
            return result

    # ---------- Bukkit / Spigot / Paper 插件 ----------
    for yml in ("plugin.yml", "paper-plugin.yml", "bukkit.yml"):
        if yml in names:
            raw = _read_zip_file(zf, yml)
            if raw:
                result["loader"] = "bukkit"
                result["filename_note"] = "这是插件(jar)而非客户端mod"
                result["modid"] = None
                return result

    # 没认出任何已知元数据，但它是合法 jar
    if "META-INF/MANIFEST.MF" in names:
        result["filename_note"] = "合法jar，但未识别到 mod 元数据"
    return result
