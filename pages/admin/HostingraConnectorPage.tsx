import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import CopyButton from '../../components/CopyButton';
import { Database, Server, Download, CheckCircle, RefreshCw, Eye, EyeOff, ShieldCheck, FileCode, Globe, Edit3, Save, Info, Network } from 'lucide-react';

const HostingraConnectorPage = () => {
    const { siteContent, updateSiteContent } = useAppContext();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);

    const hostingraContent = siteContent?.adminHostingraPage || {};
    const dbName = hostingraContent.hostingraUsername || 'u833687569_Wowfilewala';
    const dbUser = hostingraContent.hostingraUsername || 'u833687569_Wowfilewala';
    const dbPassword = hostingraContent.hostingraPassword || '2WBVSwFhmSzyc7@';
    const configuredHost = hostingraContent.databaseHost || 'localhost';
    const dbPort = hostingraContent.databasePort || '3306';

    const [isEditingHost, setIsEditingHost] = useState(false);
    const [customHostInput, setCustomHostInput] = useState(configuredHost);
    const [clientIp, setClientIp] = useState<string>('Loading...');
    const serverIpv4 = '34.34.244.150';

    useEffect(() => {
        // Fetch client public IPv4
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => {
                if (data && data.ip) setClientIp(data.ip);
            })
            .catch(() => {
                fetch('/api/my-ip')
                    .then(r => r.json())
                    .then(d => {
                        if (d && d.clientIpv4) setClientIp(d.clientIpv4);
                    })
                    .catch(() => setClientIp('Dynamic Client IP'));
            });
    }, []);

    const handleSaveHost = () => {
        const trimmed = customHostInput.trim() || 'localhost';
        updateSiteContent('adminHostingraPage.databaseHost', trimmed);
        setIsEditingHost(false);
    };

    const handleTestConnection = async (testHost?: string) => {
        setIsTesting(true);
        setTestResult(null);
        const hostToTest = testHost || configuredHost;
        try {
            // First try direct Node mysql2 test for instant feedback
            const apiRes = await fetch(`/api/test-mysql?host=${encodeURIComponent(hostToTest)}`);
            if (apiRes.ok) {
                const apiData = await apiRes.json();
                setTestResult(apiData);
                setIsTesting(false);
                return;
            }
        } catch (_err) {
            // fallback to PHP test
        }
        try {
            const res = await fetch(`/cloud-sync.php?test=1&host=${encodeURIComponent(hostToTest)}`);
            const data = await res.json();
            setTestResult(data);
        } catch (err: any) {
            setTestResult({
                success: false,
                message: 'Local Preview Note: Direct MySQL test runs on the live Hostinger PHP server. When uploaded to Hostinger public_html, localhost connects directly inside Hostinger.',
                error: err.message
            });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
            {/* Header Card */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="p-3 bg-emerald-950/50 text-emerald-400 rounded-xl border border-emerald-500/20">
                            <Database className="h-6 w-6" />
                        </span>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                Hostinger MySQL Database Hub
                                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                                    Connected
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Database: <span className="text-emerald-400 font-mono font-semibold">u833687569_Wowfilewala</span> | Host: <span className="text-amber-400 font-mono font-semibold">{configuredHost}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => handleTestConnection()}
                        disabled={isTesting}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                        {isTesting ? 'Testing MySQL...' : 'Test MySQL Connection'}
                    </button>
                </div>

                {testResult && (
                    <div className={`mt-4 p-4 rounded-xl border text-xs font-mono ${
                        testResult.success
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                    }`}>
                        <div className="flex items-start gap-2">
                            {testResult.success ? (
                                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                                <Server className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                                <p className="font-bold">{testResult.message}</p>
                                {testResult.database && (
                                    <p className="mt-1 text-slate-300">Database: <span className="text-emerald-400">{testResult.database}</span> | User: <span className="text-emerald-400">{testResult.user}</span></p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* PERMANENT IPv4 SHOWCASE CARD */}
            <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900/90 to-cyan-950/50 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                            <Network className="h-5 w-5" />
                        </span>
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                Permanent IPv4 Addresses
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono uppercase">
                                    Hostinger Remote MySQL
                                </span>
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                Hostinger hPanel me <strong>Remote MySQL</strong> configure karne ke liye yeh IPv4 addresses use karein:
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Permanent Outbound Server IPv4 */}
                    <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                    Permanent Server IPv4
                                </span>
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                                    Static
                                </span>
                            </div>
                            <span className="font-mono text-base font-bold text-emerald-300 block select-all">
                                {serverIpv4}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                                Cloud Applet Outbound IPv4. Hostinger Remote MySQL whitelist me daalein.
                            </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
                            <CopyButton textToCopy={serverIpv4} />
                        </div>
                    </div>

                    {/* 2. Wildcard IPv4 (Allow All Devices) */}
                    <div className="bg-slate-950/80 border border-cyan-500/30 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                                    Universal Wildcard IP
                                </span>
                                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                                    Recommended
                                </span>
                            </div>
                            <span className="font-mono text-2xl font-bold text-cyan-300 block select-all">
                                %
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                                Hostinger me IP Address me <code className="text-cyan-300 font-bold">%</code> daalne par sabhi devices bina block hue connect hote hain.
                            </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
                            <CopyButton textToCopy="%" />
                        </div>
                    </div>

                    {/* 3. Your Device Client IPv4 */}
                    <div className="bg-slate-950/80 border border-purple-500/30 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                                    Your Device IPv4
                                </span>
                                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                                    Live
                                </span>
                            </div>
                            <span className="font-mono text-base font-bold text-purple-300 block select-all">
                                {clientIp}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                                Aapke computer/mobile ka public IP. Agar sirf apne device ko access dena ho toh ise use karein.
                            </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
                            <CopyButton textToCopy={clientIp} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Online Host Explanation Box */}
            <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 rounded-2xl p-5 shadow-lg">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-2 text-xs leading-relaxed">
                        <h3 className="font-bold text-blue-200 text-sm">
                            Database Host &quot;localhost&quot; Online Kaise Kaam Karta Hai?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="bg-slate-950/60 border border-blue-500/20 p-3.5 rounded-xl">
                                <span className="text-emerald-400 font-bold block mb-1">✅ 1. Website Hostinger Par Upload Hote Hi:</span>
                                <p className="text-slate-300">
                                    Jab aap website ko Hostinger ke <code className="text-amber-300">public_html</code> me daalte hain, toh PHP code aur MySQL Database <strong>dono ek hi server</strong> par chalte hain. Isliye Hostinger ke andar <code className="text-emerald-300">localhost</code> hi <strong>sabse fast aur 100% online</strong> rehta hai!
                                </p>
                            </div>
                            <div className="bg-slate-950/60 border border-blue-500/20 p-3.5 rounded-xl">
                                <span className="text-indigo-400 font-bold block mb-1">🌐 2. Bahar se Access (Remote MySQL Online):</span>
                                <p className="text-slate-300">
                                    Agar aap Hostinger se bahar (jaise AI Studio ya external tool) se direct MySQL se connect hona chahte hain, toh Hostinger hPanel me <strong>Remote MySQL</strong> on karke upar diya gaya Server IPv4 <code className="text-emerald-400 font-bold">{serverIpv4}</code> ya <code className="text-cyan-400 font-bold">%</code> daal sakte hain.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hostinger DB Parameters */}
                <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            MySQL Connection Parameters
                        </h3>
                        <button
                            onClick={() => {
                                setIsEditingHost(!isEditingHost);
                                setCustomHostInput(configuredHost);
                            }}
                            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                            {isEditingHost ? 'Cancel' : 'Change Host'}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Database Host */}
                        <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl">
                            <div className="flex items-center justify-between mb-1">
                                <span className="block text-[10px] uppercase font-bold text-slate-500">Database Host</span>
                                {!isEditingHost && <CopyButton textToCopy={configuredHost} />}
                            </div>

                            {isEditingHost ? (
                                <div className="space-y-2 mt-1">
                                    <input
                                        type="text"
                                        value={customHostInput}
                                        onChange={(e) => setCustomHostInput(e.target.value)}
                                        placeholder="localhost ya Hostinger Server IP (jaise 195.35.x.x)"
                                        className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleSaveHost}
                                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                                        >
                                            <Save className="h-3.5 w-3.5" />
                                            Save Host
                                        </button>
                                        <button
                                            onClick={() => setCustomHostInput('localhost')}
                                            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                                        >
                                            Reset to localhost
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400">
                                        Hostinger website ke liye <code className="text-emerald-400">localhost</code> recommended hai. Bahar ke access ke liye Remote MySQL Server IP daalein.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-sm text-slate-200">{configuredHost}</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                                        {configuredHost === 'localhost' ? 'Default (Internal)' : 'Custom / Remote'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Database Name */}
                        <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-500">Database Name</span>
                                <span className="font-mono text-sm text-emerald-400 font-semibold">{dbName}</span>
                            </div>
                            <CopyButton textToCopy={dbName} />
                        </div>

                        {/* Database Username */}
                        <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-500">Database Username</span>
                                <span className="font-mono text-sm text-slate-200">{dbUser}</span>
                            </div>
                            <CopyButton textToCopy={dbUser} />
                        </div>

                        {/* Database Password */}
                        <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
                            <div className="flex-1 mr-2">
                                <span className="block text-[10px] uppercase font-bold text-slate-500">Database Password</span>
                                <span className="font-mono text-sm text-slate-200 tracking-wider">
                                    {isPasswordVisible ? dbPassword : '••••••••••••••••'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                                    title={isPasswordVisible ? 'Hide' : 'Show'}
                                >
                                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                <CopyButton textToCopy={dbPassword} />
                            </div>
                        </div>

                        {/* Port */}
                        <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-500">MySQL Port</span>
                                <span className="font-mono text-sm text-slate-200">{dbPort}</span>
                            </div>
                            <CopyButton textToCopy={dbPort} />
                        </div>
                    </div>
                </div>

                {/* Live Download & Actions */}
                <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <Server className="h-4 w-4 text-indigo-400" />
                            Hostinger Deployment Files
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            All your latest changes, settings, products, and MySQL connector scripts are pre-packaged.
                        </p>

                        <div className="space-y-3">
                            {/* ZIP Download Card */}
                            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                    <Download className="h-4 w-4" />
                                    <span>Complete Hostinger Website ZIP</span>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                    Includes compiled frontend + <code className="text-emerald-300">cloud-sync.php</code> (auto-connects to MySQL) + <code className="text-emerald-300">.htaccess</code>. Upload and extract inside <strong>public_html</strong>.
                                </p>
                                <a
                                    href="/api/download-hostinger-zip"
                                    download="wowfilewala-hostinger-public_html.zip"
                                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                                >
                                    <Download className="h-4 w-4" />
                                    Download wowfilewala-hostinger-public_html.zip
                                </a>
                            </div>

                            {/* SQL Download Card */}
                            <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-3">
                                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                                    <FileCode className="h-4 w-4" />
                                    <span>Hostinger MySQL Schema (.sql)</span>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                    Contains SQL commands for <code className="text-indigo-300">registered_users</code>, <code className="text-indigo-300">order_history</code>, <code className="text-indigo-300">site_settings</code>, etc. for 1-click import in phpMyAdmin.
                                </p>
                                <a
                                    href="/hostinger-database.sql"
                                    download="hostinger-database.sql"
                                    className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-white border border-indigo-500/30 font-semibold text-xs transition-all"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Download hostinger-database.sql
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How to enable Remote MySQL on Hostinger Guide */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="h-4 w-4 text-amber-400" />
                    Hostinger me &quot;Remote MySQL&quot; Online Enable Karne Ka Tarika:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">1</span>
                        <h4 className="font-bold text-slate-200 text-xs">hPanel Login</h4>
                        <p className="text-slate-400 text-[11px]">Hostinger hPanel login karein aur <strong>Databases &rarr; Remote MySQL</strong> par click karein.</p>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">2</span>
                        <h4 className="font-bold text-slate-200 text-xs">Select Database</h4>
                        <p className="text-slate-400 text-[11px]">Dropdown se apna database <strong>u833687569_Wowfilewala</strong> choose karein.</p>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">3</span>
                        <h4 className="font-bold text-slate-200 text-xs">IP me {serverIpv4} ya %</h4>
                        <p className="text-slate-400 text-[11px]">IP field me upar diya gaya Permanent Server IP <code className="text-emerald-400 font-bold">{serverIpv4}</code> ya universal <code className="text-cyan-400 font-bold">%</code> daalein aur <strong>Create</strong> dabayein.</p>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">4</span>
                        <h4 className="font-bold text-slate-200 text-xs">Hostinger Server IP</h4>
                        <p className="text-slate-400 text-[11px]">Hostinger par jo Server IP dikhai de, usse copy karke upar <strong>&quot;Change Host&quot;</strong> me paste karke Save karein!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostingraConnectorPage;
