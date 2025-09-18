import CalendarWidget from "./CalendarWidget"
import CodingStats from "./CodingStats"
import '../App.css';
import BookGoal from "./BookGoal"
import ProjectMilestones from "./ProjectMilestones"

function Dashboard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CalendarWidget />
            <CodingStats />
            <BookGoal />
            <ProjectMilestones />
        </div>
    )
}

export default Dashboard
