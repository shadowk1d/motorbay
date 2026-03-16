import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const nextConfig: NextConfig = {
	outputFileTracingRoot: path.join(__dirname),
	eslint: {
		ignoreDuringBuilds: true,
	},
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);