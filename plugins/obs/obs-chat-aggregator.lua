local obs = obslua

local twitch_channel = ""
local youtube_channel = ""
local server_port = 9090
local is_running = false

local function get_os()
    -- Check path separator to determine OS
    if package.config:sub(1,1) == "\\" then
        return "Windows"
    else
        return "Unix"
    end
end

local os_type = get_os()

function script_description()
    return "OBS Multi-Platform Realtime Chat Aggregator\n\nSpawns the local background server and manages chat extraction from Twitch and YouTube."
end

function script_properties()
    local props = obs.obs_properties_create()
    obs.obs_properties_add_text(props, "twitch_channel", "Twitch Channel", obs.OBS_TEXT_DEFAULT)
    obs.obs_properties_add_text(props, "youtube_channel", "YouTube Channel", obs.OBS_TEXT_DEFAULT)
    obs.obs_properties_add_int(props, "server_port", "Server Port", 1024, 65535, 1)
    obs.obs_properties_add_button(props, "connect_button", "Connect / Apply", function()
        stop_server()
        start_server()
        return true
    end)
    return props
end

function script_defaults(settings)
    obs.obs_data_set_default_string(settings, "twitch_channel", "ragnarokfate")
    obs.obs_data_set_default_string(settings, "youtube_channel", "@RagnarokFate")
    obs.obs_data_set_default_int(settings, "server_port", 9090)
end

function script_update(settings)
    twitch_channel = obs.obs_data_get_string(settings, "twitch_channel")
    youtube_channel = obs.obs_data_get_string(settings, "youtube_channel")
    server_port = obs.obs_data_get_int(settings, "server_port")
end

function start_server()
    if is_running then return end

    local script_dir = script_path()
    local project_root = script_dir .. "../../"
    local local_server_script = project_root .. "apps/local-server/dist/index.js"
    
    if os_type == "Windows" then
        local_server_script = local_server_script:gsub("/", "\\")
    end

    local cmd = string.format('node "%s" --port=%d', local_server_script, server_port)
    if twitch_channel ~= "" and twitch_channel ~= nil then
        cmd = cmd .. string.format(' --twitch="%s"', twitch_channel)
    end
    if youtube_channel ~= "" and youtube_channel ~= nil then
        cmd = cmd .. string.format(' --youtube="%s"', youtube_channel)
    end

    if os_type == "Windows" then
        -- Use start /B to run in background without blocking OBS
        os.execute('start /B "" ' .. cmd)
    else
        -- Use & to run in background on Unix
        os.execute(cmd .. " &")
    end
    
    is_running = true
end

function stop_server()
    if not is_running then return end
    
    if os_type == "Windows" then
        -- Kill only the Node process running our specific server script using PowerShell instead of wmic (which is deprecated/removed in Win11)
        os.execute('powershell -Command "Get-CimInstance Win32_Process | Where-Object CommandLine -match \'apps.*local-server.*dist.*index.js\' | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"')
    else
        os.execute('pkill -f "apps/local-server/dist/index.js"')
    end
    
    is_running = false
end

function script_load(settings)
    script_update(settings)
    start_server()
end

function script_unload()
    stop_server()
end
