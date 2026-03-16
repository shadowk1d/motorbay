import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const nextConfig: NextConfig = {
	outputFileTracingRoot: path.join(__dirname),
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);