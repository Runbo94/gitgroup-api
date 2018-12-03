// import * as mongoose from "mongoose";
// import { ProjectSchema } from "./../models/projectModel";
// import { Request, Response } from "express";
// const Project = mongoose.model("Project", ProjectSchema);
// export class ProjectController {
//   public addNewProject(req: Request, res: Response) {
//     let newProject = new Project(req.body);
//     newProject.save((err, project) => {
//       if (err) {
//         res.send(err);
//       }
//       res.json(project);
//     });
//   }
//   public getAllProjects(req: Request, res: Response) {
//     Project.find({}, (err, project) => {
//       if (err) {
//         res.send(err);
//       }
//       res.json(project);
//     });
//   }
// }
//# sourceMappingURL=projectController.js.map