import { NextResponse } from "next/server";
import { getErrorLogger } from "@/lib/error-logger";

/**
 * Admin API endpoint for accessing print error logs
 * Provides comprehensive error tracking and troubleshooting data
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity') as 'warning' | 'critical' | null;
    const orderId = searchParams.get('orderId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const sinceHours = searchParams.get('sinceHours') ? parseInt(searchParams.get('sinceHours')!) : undefined;
    const format = searchParams.get('format') as 'json' | 'csv' | null;
    const stats = searchParams.get('stats') === 'true';

    const logger = getErrorLogger();
    
    // Return statistics if requested
    if (stats) {
      const since = sinceHours ? new Date(Date.now() - sinceHours * 60 * 60 * 1000) : undefined;
      const statistics = logger.getErrorStats(since);
      
      return NextResponse.json({
        success: true,
        stats: statistics,
        timeframe: sinceHours ? `Last ${sinceHours} hours` : 'All time'
      });
    }

    // Build filter options
    const filterOptions: any = {};
    if (severity) filterOptions.severity = severity;
    if (orderId) filterOptions.orderId = orderId;
    if (limit) filterOptions.limit = limit;
    if (sinceHours) {
      filterOptions.since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
    }

    // Get logs
    const logs = logger.getLogs(filterOptions);

    // Return in requested format
    if (format === 'csv') {
      const csvData = logger.exportLogs('csv');
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="print-errors-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
      filters: filterOptions,
      availableFilters: {
        severity: ['warning', 'critical'],
        format: ['json', 'csv'],
        sinceHours: 'Number of hours to look back',
        limit: 'Maximum number of logs to return',
        orderId: 'Filter by specific order ID',
        stats: 'Return statistics instead of logs'
      }
    });

  } catch (error) {
    console.error("Error retrieving print logs:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to retrieve logs"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, logId, resolution, resolvedBy } = body;

    if (action === 'resolve' && logId && resolution) {
      const logger = getErrorLogger();
      const success = logger.markResolved(logId, resolution, resolvedBy || 'admin');

      if (success) {
        return NextResponse.json({
          success: true,
          message: `Log ${logId} marked as resolved`,
          resolution,
          resolvedBy: resolvedBy || 'admin'
        });
      } else {
        return NextResponse.json(
          { success: false, error: `Log ${logId} not found` },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or missing parameters" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error processing print logs action:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Action failed"
      },
      { status: 500 }
    );
  }
}