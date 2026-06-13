import { Link } from "react-router-dom";
import { product } from "../../copy/es";
import { useAuth } from "../../contexts/AuthContext";

interface AgoraBrandLinkProps {
	className?: string;
}

const AgoraBrandLink = ({ className }: AgoraBrandLinkProps) => {
	const { user, loading } = useAuth();
	const to = !loading && user ? "/dashboard" : "/";

	return (
		<Link to={to} className={className}>
			{product.name}
		</Link>
	);
};

export default AgoraBrandLink;
