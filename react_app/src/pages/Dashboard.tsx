import AbsenceTable from '../components/tables/absence_table/AbsenceTable';
import EmployeeRankingTable from '../components/tables/EmployeeRankingTable';

const Dashboard: React.FC = () => {
  return (
    <div className='container mx-auto'>
      <AbsenceTable />
      <EmployeeRankingTable />
    </div>
  );
};

export default Dashboard;
