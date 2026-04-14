import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '../../stores/settings';
import { useThemeStore } from '../../stores/theme';
import { useAuthActions, useAuthLoading, useUser } from '../../stores/authData';
import useLogsStore from '../../stores/logsData';
import { Heart, ArrowLeft, LogOut, Search, Calendar, Filter, ChevronUp, ChevronDown } from 'lucide-react';
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
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
                
                {/* Filter Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'sad', 'miss', 'today'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(type)}
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedLogs.map((log, index) => (
                      <tr 
                        key={log.id} 
                        className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                        style={{ borderColor: `${themeColor}10` }}
                      >
                        <td className="p-3 text-sm">{formatDateTimeDetailed(log.created_at)}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
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