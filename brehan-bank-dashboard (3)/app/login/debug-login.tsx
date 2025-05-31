"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugLogin() {
  const [showDebug, setShowDebug] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{ token: string | null, user: any | null }>({
    token: null,
    user: null
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      let user = null;
      
      try {
        if (userStr) {
          user = JSON.parse(userStr);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
      
      setTokenInfo({ token, user });
    }
  }, []);

  if (!showDebug) {
    return (
      <Button 
        variant="ghost" 
        className="text-xs opacity-50 mt-4"
        onClick={() => setShowDebug(true)}
      >
        Debug Mode
      </Button>
    );
  }

  return (
    <Card className="mt-4 border-dashed border-gray-300 bg-gray-50">
      <CardHeader className="py-2">
        <CardTitle className="text-sm flex justify-between">
          <span>Debug Information</span>
          <Button 
            variant="ghost" 
            className="h-6 text-xs" 
            onClick={() => setShowDebug(false)}
          >
            Hide
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 text-xs font-mono">
        <div>
          <strong>Token Status:</strong> {tokenInfo.token ? 'Present' : 'Missing'}
        </div>
        {tokenInfo.token && (
          <div className="mt-1">
            <strong>Token Preview:</strong> {tokenInfo.token.substring(0, 20)}...
          </div>
        )}
        {tokenInfo.user && (
          <div className="mt-1">
            <strong>User Info:</strong> {JSON.stringify(tokenInfo.user, null, 2)}
          </div>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 h-6 text-xs"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            setTokenInfo({ token: null, user: null });
          }}
        >
          Clear Auth Data
        </Button>
      </CardContent>
    </Card>
  );
} 