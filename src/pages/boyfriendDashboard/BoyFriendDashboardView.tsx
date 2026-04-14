import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '../../stores/settings';
import { useThemeStore } from '../../stores/theme';
import { useAuthActions, useAuthLoading, useUser } from '../../stores/authData';
import useLogsStore from '../../stores/logsData';
import { Heart, ArrowLeft, LogOut, Search, Calendar, Filter, ChevronUp, ChevronDown, Info, Smartphone, MapPin } from 'lucide-react';
import { formatDateTimeDetailed } from './utils/helpers';


interface BoyFriendDashboardViewProps {
  onNavigate?: (path: string) => void;
}

const BoyFriendDashboardView: React.FC<BoyFriendDashboardViewProps> = ({ onNavigate }) => {
 
  const {  getAppName } = useSettingsStore();
  const { getCurrentThemeColor } = useThemeStore();
  
  // Auth state
  const user = useUser();
  const isLoading = useAuthLoading();
  const { logout } = useAuthActions();
  
  // Logs store
  const { 
    logs, 
    fetchLogs, 
    isLoading: logsLoading, 
    error: logsError,
    getTodaysLogs,
    getSadLetterLogs,
    getMissLetterLogs
  } = useLogsStore();
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sad' | 'miss' | 'today'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  const themeColor = getCurrentThemeColor();
  
  const appName = getAppName();

  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filter and sort logs
  const filteredAndSortedLogs = useMemo(() => {
    let filtered = logs;

    // Apply type filter
    switch (filterType) {
      case 'sad':
        filtered = getSadLetterLogs();
        break;
      case 'miss':
        filtered = getMissLetterLogs();
        break;
      case 'today':
        filtered = getTodaysLogs();
        break;
      default:
        filtered = logs;
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.created_at?.toLowerCase().includes(searchLower)
      );
    }

    // Apply month filter
    if (selectedMonth) {
      filtered = filtered.filter(log => {
        if (!log.created_at) return false;
        const logDate = new Date(log.created_at);
        const logMonthYear = `${logDate.getFullYear()}-${(logDate.getMonth() + 1).toString().padStart(2, '0')}`;
        return logMonthYear === selectedMonth;
      });
    }

    // Sort logs
    return filtered.sort((a, b) => {
      const aVal = new Date(a.created_at || 0).getTime();
      const bVal = new Date(b.created_at || 0).getTime();
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [logs, searchTerm, filterType, selectedMonth, sortBy, sortDirection, getSadLetterLogs, getMissLetterLogs, getTodaysLogs]);

  const handleSort = (field: 'created_at') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const toggleRowExpansion = (logId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('/');
    }
  };

  const handleLogout = async () => {
    await logout();
    // Redirect to auth page after logout
    if (onNavigate) {
      onNavigate('/auth');
    }
  };

  return (
    <div 
      className="min-h-screen p-4"
      style={{
        background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}05)`
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-sm"
            style={{ color: themeColor }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {appName}
          </Button>
          
          <div className="flex items-center gap-3">
            {user && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoading}
                className="flex items-center gap-2 text-sm"
                style={{ color: themeColor }}
              >
                <LogOut className="w-4 h-4" />
                {isLoading ? 'Logging out...' : 'Logout'}
              </Button>
            )}
            
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <Heart 
                className="w-5 h-5"
                style={{ color: themeColor }}
                fill={`${themeColor}40`}
              />
            </div>
          </div>
        </div>

        {/* Logs Dashboard */}
        <Card className="mb-6" style={{ borderColor: `${themeColor}30` }}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle style={{ color: themeColor }} className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Love Letters Activity Logs
              </CardTitle>
              
              <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
                {/* Search and Month container */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-48"
                      style={{ borderColor: `${themeColor}30` }}
                    />
                  </div>
                  
                  {/* Month Picker */}
                  <div className="relative">
                    <Input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full sm:w-40"
                      style={{ borderColor: `${themeColor}30` }}
                      placeholder="Filter by month"
                    />
                    {selectedMonth && (
                      <button
                        onClick={() => setSelectedMonth('')}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                        title="Clear month filter"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Filter Buttons - Single Row */}
                <div className="flex gap-1 shrink-0">
                  {(['all', 'sad', 'miss', 'today'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(type)}
                      className="text-xs px-3 whitespace-nowrap"
                      style={{
                        backgroundColor: filterType === type ? themeColor : 'transparent',
                        borderColor: themeColor,
                        color: filterType === type ? 'white' : themeColor
                      }}
                    >
                      {type === 'all' && <Filter className="w-3 h-3 mr-1" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {logsError && (
              <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md">
                Error: {logsError}
              </div>
            )}

            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColor }}></div>
                <span className="ml-3 text-gray-600">Loading logs...</span>
              </div>
            ) : filteredAndSortedLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {logs.length === 0 ? 'No logs found' : 'No logs match your filters'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b" style={{ borderColor: `${themeColor}20` }}>
                      <th className="text-left p-3 font-medium" style={{ color: themeColor }}>
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center gap-1 hover:opacity-70"
                        >
                          Date Created
                          {sortBy === 'created_at' && (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="text-center p-3 font-medium" style={{ color: themeColor }}>Sad Letter</th>
                      <th className="text-center p-3 font-medium" style={{ color: themeColor }}>Miss Letter</th>
                      <th className="text-center p-3 font-medium hidden lg:table-cell" style={{ color: themeColor }}>Device</th>
                      <th className="text-center p-3 font-medium hidden xl:table-cell" style={{ color: themeColor }}>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedLogs.map((log, index) => (
                      <React.Fragment key={log.id}>
                        <tr 
                          className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'} ${(log.device || log.address) ? 'cursor-pointer lg:cursor-default' : ''}`}
                          style={{ borderColor: `${themeColor}10` }}
                          onClick={() => (log.device || log.address) && window.innerWidth < 1024 ? toggleRowExpansion(log.id!) : undefined}
                        >
                          <td className="p-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span>{formatDateTimeDetailed(log.created_at)}</span>
                              {(log.device || log.address) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="lg:hidden p-1 h-auto w-auto"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRowExpansion(log.id!);
                                  }}
                                >
                                  <Info className="w-3 h-3" style={{ color: themeColor }} />
                                </Button>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {log.is_sad_letter === null ? (
                              <span className="text-gray-400 text-xs">N/A</span>
                            ) : log.is_sad_letter ? (
                              <span className="text-green-600 text-lg">✅</span>
                            ) : (
                              <span></span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {log.is_miss_letter === null ? (
                              <span className="text-gray-400 text-xs">N/A</span>
                            ) : log.is_miss_letter ? (
                              <span className="text-green-600 text-lg">✅</span>
                            ) : (
                              <span></span>
                            )}
                          </td>
                          <td className="p-3 text-xs hidden lg:table-cell" title={log.device || 'Unknown Device'}>
                            {log.device ? (
                              <span className="inline-block max-w-32 truncate text-gray-700">
                                {log.device.includes('iPhone') && '📱'}
                                {log.device.includes('iPad') && '📱'}
                                {log.device.includes('Android') && '📱'}
                                {log.device.includes('Desktop') && '💻'}
                                {log.device.includes('Chrome') && '🌐'}
                                {log.device.includes('Safari') && '🌐'}
                                {log.device.includes('Firefox') && '🌐'}
                                {log.device.includes('Edge') && '🌐'}
                                {!log.device.match(/(iPhone|iPad|Android|Desktop|Chrome|Safari|Firefox|Edge)/) && '🖥️'}
                                {' '}{log.device.split('(')[0].trim()}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Unknown</span>
                            )}
                          </td>
                          <td className="p-3 text-xs hidden xl:table-cell" title={log.address || 'Location unavailable'}>
                            {log.address ? (
                              <span className="inline-block max-w-40 truncate text-gray-700">
                                {log.address.includes('GPS') && '🛰️'}
                                {log.address.includes('IP-based') && '🌐'}
                                {log.address.includes('Timezone') && '🕐'}
                                {log.address.includes('Platform') && '🖥️'}
                                {log.address.includes('denied') && '🚫'}
                                {log.address.includes('unavailable') && '❌'}
                                {log.address.includes('timeout') && '⏱️'}
                                {' '}{log.address.split('(')[0].trim()}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Unknown</span>
                            )}
                          </td>
                        </tr>
                        
                        {/* Mobile expansion row */}
                        {expandedRows.has(log.id!) && (log.device || log.address) && (
                          <tr className="lg:hidden border-b" style={{ borderColor: `${themeColor}10` }}>
                            <td colSpan={3} style={{ backgroundColor: `${themeColor}05` }}>
                              <div className="p-4 space-y-3">
                                {log.device && (
                                  <div className="flex items-start gap-3">
                                    <Smartphone className="w-4 h-4 mt-0.5" style={{ color: themeColor }} />
                                    <div>
                                      <div className="text-xs font-medium" style={{ color: themeColor }}>Device</div>
                                      <div className="text-xs text-gray-700 mt-1">{log.device}</div>
                                    </div>
                                  </div>
                                )}
                                {log.address && (
                                  <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 mt-0.5" style={{ color: themeColor }} />
                                    <div>
                                      <div className="text-xs font-medium" style={{ color: themeColor }}>Location</div>
                                      <div className="text-xs text-gray-700 mt-1">{log.address}</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${themeColor}10` }}>
                    <div className="text-2xl font-bold" style={{ color: themeColor }}>{logs.length}</div>
                    <div className="text-xs text-gray-600">Total Logs</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${themeColor}10` }}>
                    <div className="text-2xl font-bold" style={{ color: themeColor }}>{getSadLetterLogs().length}</div>
                    <div className="text-xs text-gray-600">Sad Letters</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${themeColor}10` }}>
                    <div className="text-2xl font-bold" style={{ color: themeColor }}>{getMissLetterLogs().length}</div>
                    <div className="text-xs text-gray-600">Miss Letters</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${themeColor}10` }}>
                    <div className="text-2xl font-bold" style={{ color: themeColor }}>{getTodaysLogs().length}</div>
                    <div className="text-xs text-gray-600">Today</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${themeColor}10` }}>
                    <div className="text-2xl font-bold" style={{ color: themeColor }}>
                      {new Set(logs.filter(log => log.device).map(log => log.device?.split('(')[0].trim())).size}
                    </div>
                    <div className="text-xs text-gray-600">Unique Devices</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${themeColor}10` }}>
                    <div className="text-2xl font-bold" style={{ color: themeColor }}>
                      {logs.filter(log => log.address?.includes('GPS')).length}
                    </div>
                    <div className="text-xs text-gray-600">GPS Locations</div>
                  </div>
                </div>
                
                {/* Device & Location Analytics */}
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${themeColor}05`, border: `1px solid ${themeColor}20` }}>
                    <h4 className="text-sm font-medium mb-3" style={{ color: themeColor }}>📱 Device Usage</h4>
                    <div className="space-y-2 text-xs">
                      {[...new Set(logs.filter(log => log.device).map(log => log.device?.split('(')[0].trim()))]
                        .slice(0, 4)
                        .map(device => {
                          const count = logs.filter(log => log.device?.startsWith(device || '')).length;
                          return (
                            <div key={device} className="flex justify-between items-center">
                              <span className="text-gray-700 flex items-center gap-1">
                                {device?.includes('iPhone') && '📱'}
                                {device?.includes('iPad') && '📱'}
                                {device?.includes('Android') && '📱'}
                                {device?.includes('Desktop') && '💻'}
                                {!device?.match(/(iPhone|iPad|Android|Desktop)/) && '🖥️'}
                                {device}
                              </span>
                              <span className="font-medium" style={{ color: themeColor }}>{count}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${themeColor}05`, border: `1px solid ${themeColor}20` }}>
                    <h4 className="text-sm font-medium mb-3" style={{ color: themeColor }}>📍 Location Methods</h4>
                    <div className="space-y-2 text-xs">
                      {[
                        { 
                          label: '🛰️ GPS Location', 
                          count: logs.filter(log => log.address?.includes('GPS')).length 
                        },
                        { 
                          label: '🌐 IP Location', 
                          count: logs.filter(log => log.address?.includes('IP-based')).length 
                        },
                        { 
                          label: '🕐 Timezone', 
                          count: logs.filter(log => log.address?.includes('Timezone')).length 
                        },
                        { 
                          label: '🚫 Denied/Failed', 
                          count: logs.filter(log => log.address?.match(/(denied|unavailable|timeout|failed)/)).length 
                        }
                      ].filter(item => item.count > 0).map(item => (
                        <div key={item.label} className="flex justify-between items-center">
                          <span className="text-gray-700">{item.label}</span>
                          <span className="font-medium" style={{ color: themeColor }}>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💝 This space is crafted with infinite love for someone very special
          </p>
        </div>
      </div>
    </div>
  );
};

export default BoyFriendDashboardView;